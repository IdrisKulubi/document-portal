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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const checkIframeLoaded = () => {
      setLoading(false);
      setTimeout(() => {
        const printPrompt = window.print();
        // Close window after print dialog is closed
        if (printPrompt !== undefined) {
          Promise.resolve(printPrompt).then(() => {
            window.close();
          });
        } else {
          // For browsers that don't return a promise
          const checkPrinting = setInterval(() => {
            if (!document.hidden) {
              clearInterval(checkPrinting);
              window.close();
            }
          }, 1000);
        }
      }, 1000);
    };

    const handleError = () => {
      setError("Failed to load document");
      setLoading(false);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = checkIframeLoaded;
      iframe.onerror = handleError;
    }

    // Cleanup
    return () => {
      if (iframe) {
        iframe.onload = null;
        iframe.onerror = null;
      }
    };
  }, []);

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
      <iframe
        ref={iframeRef}
        src={pdfUrl}
        className={`w-full h-screen ${loading ? "hidden" : "block"}`}
        style={{ border: "none" }}
      />
    </div>
  );
}
