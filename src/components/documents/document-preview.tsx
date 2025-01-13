"use client";

import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
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
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const handlePrint = () => {
    try {
      // Open PDF in a new window
      const printWindow = window.open(
        `${doc.fileUrl}#toolbar=0&view=FitH&scrollbar=0&print-scale=1.0`,
        "_blank",
        "width=800,height=600"
      );

      if (printWindow) {
        printWindow.onload = () => {
          try {
            printWindow.print();
            // Close the window after printing
            setTimeout(() => {
              printWindow.close();
            }, 1000);
          } catch (error) {
            console.error("Print error:", error);
          }
        };
      }
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
    </>
  );
}
