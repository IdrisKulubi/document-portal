"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function PrintViewer({ params }: { params: { token: string } }) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printAccessToken, setPrintAccessToken] = useState<string | null>(null);
  const router = useRouter();
  const printAttempted = useRef(false);

  useEffect(() => {
    const beforePrint = async () => {
      if (printAttempted.current) return;
      printAttempted.current = true;

      try {
        // Get print access token when print dialog opens
        const response = await fetch("/api/print/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            printToken: params.token,
            status: "printing",
          }),
        });

        if (!response.ok) throw new Error("Failed to get print access");
        const { printAccessToken } = await response.json();

        setPrintAccessToken(printAccessToken);
        setIsPrinting(true);
      } catch (error) {
        console.error("Print access error:", error);
        window.close();
      }
    };

    const afterPrint = () => {
      setIsPrinting(false);
      setPrintAccessToken(null);
      window.close();
    };

    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);

    // Auto-trigger print dialog
    window.print();

    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, [params.token]);

  return (
    <div className={`print-container ${isPrinting ? "printing" : ""}`}>
      {printAccessToken ? (
        <iframe
          src={`/api/print/view/${printAccessToken}`}
          className="w-full h-full"
          style={{ display: isPrinting ? "block" : "none" }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-lg mb-4">
            Please use the print dialog to print this document.
          </p>
          <p className="text-sm text-gray-500">
            The content will be visible only during printing.
          </p>
        </div>
      )}
    </div>
  );
}
