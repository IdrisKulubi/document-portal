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
import { Eye, Download, Printer } from "lucide-react";
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

      // Open in new window for printing
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          // Clean up after printing
          printWindow.onafterprint = () => {
            URL.revokeObjectURL(url);
            printWindow.close();
          };
        };
      }
    } catch (error) {
      console.error("Error printing document:", error);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-4 w-4" />
        Preview
      </Button>

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
          <div className="aspect-video w-full overflow-hidden rounded-md">
            {document.fileType === "application/pdf" ? (
              <iframe
                src={`${document.fileUrl}#toolbar=0`}
                className="h-full w-full"
                title={document.title}
              />
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
