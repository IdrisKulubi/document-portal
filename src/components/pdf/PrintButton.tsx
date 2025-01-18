"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrintButtonProps {
  documentId: string;
}

export function PrintButton({ documentId }: PrintButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const { toast } = useToast();

  const handlePrint = async () => {
    try {
      setIsPrinting(true);

      // Get secure print URL
      const response = await fetch(`/api/print/${documentId}`);
      if (!response.ok) throw new Error("Failed to get print URL");

      const { printUrl } = await response.json();

      // Open print window with secure viewer
      const printWindow = window.open(
        `/print/${printUrl.split("/").pop()}`,
        "_blank",
        "width=800,height=600"
      );

      if (printWindow) {
        const checkClosed = setInterval(() => {
          if (printWindow.closed) {
            clearInterval(checkClosed);
            setIsPrinting(false);
          }
        }, 1000);
      } else {
        throw new Error("Popup blocked");
      }
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to print document",
        variant: "destructive",
      });
      setIsPrinting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handlePrint}
      disabled={isPrinting}
    >
      <Printer className="h-4 w-4" />
      {isPrinting ? "Printing..." : "Print"}
    </Button>
  );
}
