"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Printer } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface SecurePrintViewerProps {
  documentUrl: string;
  printToken: string;
}

const SecurePrintViewer = ({
  printToken,
}: SecurePrintViewerProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent context menu and keyboard shortcuts
  useEffect(() => {
    const preventDefaultActions = (e: KeyboardEvent | MouseEvent) => {
      if (
        e instanceof KeyboardEvent &&
        ((e.ctrlKey && (e.key === "p" || e.key === "P")) ||
          (e.ctrlKey && (e.key === "s" || e.key === "S")))
      ) {
        e.preventDefault();
        return false;
      }
      if (e instanceof MouseEvent && e.type === "contextmenu") {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener("keydown", preventDefaultActions);
    window.addEventListener("contextmenu", preventDefaultActions);

    return () => {
      window.removeEventListener("keydown", preventDefaultActions);
      window.removeEventListener("contextmenu", preventDefaultActions);
    };
  }, []);

  const handlePrint = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/print/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to print document");
      }

      // Create a temporary URL for the PDF blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Create a hidden iframe for printing
      const printFrame = document.createElement("iframe");
      printFrame.style.display = "none";
      printFrame.src = url;

      // Wait for iframe to load before printing
      printFrame.onload = () => {
        // Add event listener for after print
        const handleAfterPrint = () => {
          window.removeEventListener("afterprint", handleAfterPrint);
          // Cleanup after printing is complete
          document.body.removeChild(printFrame);
          URL.revokeObjectURL(url);
          setLoading(false);
        };

        window.addEventListener("afterprint", handleAfterPrint);

        // Focus the iframe and trigger print
        printFrame.contentWindow?.focus();
        setTimeout(() => {
          printFrame.contentWindow?.print();
        }, 500);
      };

      document.body.appendChild(printFrame);
    } catch (err) {
      console.error(err);
      setError("Failed to print document");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="print-container select-none">
      <div
        className="w-full h-screen bg-gray-100 flex flex-col items-center justify-center"
        onContextMenu={(e) => e.preventDefault()}
      >
        <Image
          src="/preview-placeholder.png"
          alt="Document Preview"
          className="max-w-full max-h-[calc(100vh-100px)] object-contain select-none mb-4"
          style={{
            userSelect: "none",
            pointerEvents: "none",
            WebkitUserSelect: "none",
          }}
          width={1000}
          height={1000}
          unoptimized
        />
        <Button onClick={handlePrint} disabled={loading} className="mt-4">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Printer className="h-4 w-4 mr-2" />
          )}
          {loading ? "Printing..." : "Print Document"}
        </Button>
      </div>
    </div>
  );
};

export default SecurePrintViewer;
