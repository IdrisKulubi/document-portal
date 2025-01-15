declare module "*printerAddon" {
  export interface PrinterAddon {
    printDocument(fileUrl: string, printer: string): number;
    getPrinters(): string[];
  }
  const printerAddon: PrinterAddon;
  export default printerAddon;
}
