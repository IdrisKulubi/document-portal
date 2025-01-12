"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {  Download, Printer } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface DocumentPreviewProps {
  document: {
    id: string;
    title: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  };
  onDownload?: () => void;
}

export function DocumentPreview({
  document,
  onDownload,
}: DocumentPreviewProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const handlePrint = async () => {
    try {
      const response = await fetch(document.fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const printFrame = window.document.createElement("iframe");
      printFrame.style.cssText = "position:fixed; top:0; left:0; display:none;";
      window.document.body.appendChild(printFrame);

      printFrame.contentDocument?.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${document.title}</title>
          </head>
          <body>
            <embed src="${url}#toolbar=0" type="${document.fileType}" style="width:100%; height:100vh;" />
            <script>
              window.print();
              window.onafterprint = () => {
                URL.revokeObjectURL('${url}');
                window.frameElement?.remove();
              };
            </script>
          </body>
        </html>
      `);
      printFrame.contentDocument?.close();
    } catch (error) {
      console.error("Error printing document:", error);
    }
  };

  return (
    <>
      

      {isAdmin && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onDownload}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4" />
        Print
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{document.title}</DialogTitle>
            <DialogDescription>
              {formatBytes(document.fileSize)} • {document.fileType}
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded-md relative">
            {document.fileType === "application/pdf" ? (
              <div className="h-full">
                <div className="absolute inset-0 bg-black/95 z-10 flex items-center justify-center print:hidden">
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8">
                    <p className="text-red-500 text-8xl font-black tracking-wider text-center px-4">
                      FOR PRINTING ONLY
                    </p>
                    <p className="text-red-500 text-8xl font-black tracking-wider text-center px-4">
                      FOR PRINTING ONLY
                    </p>
                    <p className="text-red-500 text-8xl font-black tracking-wider text-center px-4">
                      FOR PRINTING ONLY
                    </p>
                  </div>
                </div>
                <iframe
                  src={`${document.fileUrl}#toolbar=0`}
                  className="h-full w-full"
                  title={document.title}
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                  Preview not available for this file type
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
