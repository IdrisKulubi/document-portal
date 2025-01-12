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
import { Download, Printer } from "lucide-react";
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
  document: doc,
  onDownload,
}: DocumentPreviewProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const handlePrint = async () => {
    try {
      const printFrame = document.createElement("iframe");
      printFrame.style.display = "none";
      document.body.appendChild(printFrame);

      const frameDoc =
        printFrame.contentDocument || printFrame.contentWindow?.document;
      if (!frameDoc) return;

      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc.title}</title>
            <style>
              @media screen { 
                body { display: none !important; } 
              }
              @media print { 
                body { display: block !important; } 
              }
            </style>
          </head>
          <body>
            <embed
              src="${doc.fileUrl}#toolbar=0&view=FitH"
              type="${doc.fileType}"
              style="width:100%; height:100vh;"
            />
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        window.print();
        printFrame.remove();
      }, 1000);
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
            <DialogTitle>{doc.title}</DialogTitle>
            <DialogDescription>
              {formatBytes(doc.fileSize)} • {doc.fileType}
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded-md relative bg-black/95">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-red-500 text-4xl font-black text-center px-4">
                PRINT ONLY - NO PREVIEW AVAILABLE
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
