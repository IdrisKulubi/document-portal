#include <napi.h>
#include <windows.h>
#include <winspool.h>
#include <string>
#include <wininet.h>
#pragma comment(lib, "wininet.lib")
#pragma comment(lib, "winspool.lib")

// Helper function to download file to temp location
std::wstring DownloadToTemp(const std::string &url)
{
    WCHAR tempPath[MAX_PATH];
    WCHAR tempFile[MAX_PATH];
    GetTempPathW(MAX_PATH, tempPath);
    GetTempFileNameW(tempPath, L"doc", 0, tempFile);

    HINTERNET hInternet = InternetOpenA("PrinterAddon", INTERNET_OPEN_TYPE_DIRECT, NULL, NULL, 0);
    HINTERNET hFile = InternetOpenUrlA(hInternet, url.c_str(), NULL, 0, INTERNET_FLAG_RELOAD, 0);

    HANDLE hTemp = CreateFileW(tempFile, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_TEMPORARY, NULL);

    char buffer[8192];
    DWORD bytesRead;
    while (InternetReadFile(hFile, buffer, sizeof(buffer), &bytesRead) && bytesRead > 0)
    {
        WriteFile(hTemp, buffer, bytesRead, &bytesRead, NULL);
    }

    CloseHandle(hTemp);
    InternetCloseHandle(hFile);
    InternetCloseHandle(hInternet);

    return std::wstring(tempFile);
}

Napi::Value PrintDocument(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    if (info.Length() < 2)
    {
        throw Napi::Error::New(env, "Wrong number of arguments");
    }

    std::string fileUrl = info[0].As<Napi::String>();
    std::string printerName = info[1].As<Napi::String>();

    // Download file to temp location
    std::wstring tempFile = DownloadToTemp(fileUrl);

    HANDLE hPrinter;
    if (!OpenPrinterA((LPSTR)printerName.c_str(), &hPrinter, NULL))
    {
        DeleteFileW(tempFile.c_str());
        throw Napi::Error::New(env, "Failed to open printer");
    }

    // Configure print job
    DOCINFOW docInfo = {0};
    docInfo.cbSize = sizeof(DOCINFOW);
    docInfo.lpszDocName = L"Secure Print";
    docInfo.lpszOutput = NULL;
    docInfo.lpszDatatype = L"RAW";
    docInfo.fwType = 0;

    // Start print job
    int jobId = StartDocPrinterW(hPrinter, 1, (LPBYTE)&docInfo);
    if (jobId == 0)
    {
        ClosePrinter(hPrinter);
        DeleteFileW(tempFile.c_str());
        throw Napi::Error::New(env, "Failed to start print job");
    }

    // Read and send file directly to printer
    HANDLE hFile = CreateFileW(tempFile.c_str(), GENERIC_READ, 0, NULL, OPEN_EXISTING, 0, NULL);
    if (hFile != INVALID_HANDLE_VALUE)
    {
        char buffer[8192];
        DWORD bytesRead, bytesWritten;

        StartPagePrinter(hPrinter);

        while (ReadFile(hFile, buffer, sizeof(buffer), &bytesRead, NULL) && bytesRead > 0)
        {
            WritePrinter(hPrinter, buffer, bytesRead, &bytesWritten);
        }

        EndPagePrinter(hPrinter);
        CloseHandle(hFile);
    }

    EndDocPrinter(hPrinter);
    ClosePrinter(hPrinter);

    // Clean up temp file
    DeleteFileW(tempFile.c_str());

    return Napi::Number::New(env, jobId);
}

Napi::Value GetPrinters(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    DWORD needed, returned;
    EnumPrintersA(PRINTER_ENUM_LOCAL, NULL, 1, NULL, 0, &needed, &returned);

    BYTE *buffer = new BYTE[needed];
    PRINTER_INFO_1 *printerInfo;

    EnumPrintersA(PRINTER_ENUM_LOCAL, NULL, 1, buffer, needed, &needed, &returned);
    printerInfo = (PRINTER_INFO_1 *)buffer;

    Napi::Array printers = Napi::Array::New(env, returned);

    for (DWORD i = 0; i < returned; i++)
    {
        printers[i] = Napi::String::New(env, printerInfo[i].pName);
    }

    delete[] buffer;
    return printers;
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set("printDocument", Napi::Function::New(env, PrintDocument));
    exports.Set("getPrinters", Napi::Function::New(env, GetPrinters));
    return exports;
}

NODE_API_MODULE(printerAddon, Init)