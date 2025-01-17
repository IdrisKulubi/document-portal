"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface SecurePrintViewerProps {
  pdfUrl: string;
  watermark: string;
}

export function SecurePrintViewer({ pdfUrl }: SecurePrintViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    // Create a hidden iframe for printing
    if (!printFrameRef.current) {
      const frame = document.createElement("iframe");
      frame.style.visibility = "hidden";
      frame.style.position = "fixed";
      frame.style.right = "0";
      frame.style.bottom = "0";
      frame.style.width = "0";
      frame.style.height = "0";
      frame.src = pdfUrl;
      document.body.appendChild(frame);
      printFrameRef.current = frame;
    }

    const handleLoad = () => {
      setLoading(false);
      // Wait longer for the PDF to fully render
      setTimeout(() => {
        if (!isPrinting) {
          setIsPrinting(true);
          // Use the hidden iframe for printing
          if (printFrameRef.current?.contentWindow) {
            const printResult = printFrameRef.current.contentWindow.print() as
              | Promise<void>
              | undefined;

            // Handle print dialog close
            if (printResult !== undefined) {
              printResult
                .then(() => {
                  // Print completed or cancelled
                  window.close();
                })
                .catch(() => {
                  // Print failed or was cancelled
                  setIsPrinting(false);
                });
            } else {
              // For browsers that don't return a promise from print()
              const checkPrintFinished = setInterval(() => {
                if (!document.hidden) {
                  clearInterval(checkPrintFinished);
                  // Give user a moment to see the preview after printing
                  setTimeout(() => {
                    window.close();
                  }, 1000);
                }
              }, 500);
            }
          }
        }
      }, 2000);
    };

    const handleError = () => {
      setError("Failed to load document");
      setLoading(false);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = handleLoad;
      iframe.onerror = handleError;
    }

    return () => {
      if (iframe) {
        iframe.onload = null;
        iframe.onerror = null;
      }
      // Clean up the print iframe
      if (printFrameRef.current) {
        document.body.removeChild(printFrameRef.current);
        printFrameRef.current = null;
      }
    };
  }, [pdfUrl, isPrinting]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="print-container">
      {loading && (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Preparing document for printing...</span>
        </div>
      )}
      {isPrinting && !loading && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow">
          Printing in progress...
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={pdfUrl}
        className={`w-full h-screen ${loading ? "hidden" : "block"}`}
        style={{ border: "none" }}
      />
    </div>
  );
}
