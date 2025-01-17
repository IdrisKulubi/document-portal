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
      setTimeout(() => {
        // Use the hidden iframe for printing
        if (printFrameRef.current?.contentWindow) {
          printFrameRef.current.contentWindow.print();
        }

        // Monitor for print completion
        const checkPrintFinished = setInterval(() => {
          if (!document.hidden) {
            clearInterval(checkPrintFinished);
            window.close();
          }
        }, 1000);
      }, 1500);
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
  }, [pdfUrl]);

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
