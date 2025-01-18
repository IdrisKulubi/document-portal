"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface SecurePrintViewerProps {
  documentUrl: string;
}

const SecurePrintViewer = ({ documentUrl }: SecurePrintViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
<<<<<<< Updated upstream
  const iframeRef = useRef<HTMLIFrameElement>(null);
=======
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
>>>>>>> Stashed changes

  // Prevent context menu and keyboard shortcuts
  useEffect(() => {
<<<<<<< Updated upstream
    const handleLoad = () => {
      setLoading(false);
      // Wait a bit to ensure PDF is fully rendered
      setTimeout(() => {
        window.print();
        // Wait for print dialog to close
        const checkPrintFinished = setInterval(() => {
          if (!document.hidden) {
            clearInterval(checkPrintFinished);
            window.close();
          }
        }, 1000);
      }, 1500);
=======
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
>>>>>>> Stashed changes
    };

    window.addEventListener("keydown", preventDefaultActions);
    window.addEventListener("contextmenu", preventDefaultActions);

    return () => {
<<<<<<< Updated upstream
      if (iframe) {
        iframe.onload = null;
        iframe.onerror = null;
      }
    };
  }, [pdfUrl]);
=======
      window.removeEventListener("keydown", preventDefaultActions);
      window.removeEventListener("contextmenu", preventDefaultActions);
    };
  }, []);

  useEffect(() => {
    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    printFrame.src = documentUrl;
    document.body.appendChild(printFrame);
    printFrameRef.current = printFrame;

    const handleLoad = () => {
      try {
        // Inject print-specific styles
        const style = document.createElement("style");
        style.textContent = `
          @media print {
            @page {
              size: auto;
              margin: 0;
            }
            body { 
              visibility: hidden;
            }
            #print-content {
              visibility: visible;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
            }
          }
        `;
        printFrame.contentDocument?.head.appendChild(style);

        // Prepare print content
        const originalContent =
          printFrame.contentDocument?.body.innerHTML || "";
        printFrame.contentDocument!.body.innerHTML = `
          <div id="print-content">
            ${originalContent}
          </div>
        `;

        setLoading(false);

        // Automatically trigger print
        setTimeout(() => {
          if (printFrame.contentWindow) {
            setIsPrinting(true);
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();

            // Listen for after print to clean up
            const afterPrint = () => {
              setIsPrinting(false);
              window.removeEventListener("afterprint", afterPrint);
            };
            window.addEventListener("afterprint", afterPrint);
          }
        }, 500);
      } catch (err) {
        setError("Failed to prepare document for printing");
        console.error(err);
      }
    };

    printFrame.onload = handleLoad;

    return () => {
      if (printFrame && printFrame.parentNode) {
        printFrame.parentNode.removeChild(printFrame);
      }
    };
  }, [documentUrl]);
>>>>>>> Stashed changes

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
      {loading || isPrinting ? (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">
            {loading ? "Preparing document..." : "Opening print dialog..."}
          </span>
        </div>
      ) : (
        <div
          className="w-full h-screen bg-gray-100 flex flex-col items-center justify-center"
          onContextMenu={(e) => e.preventDefault()}
        >
          <Image
            src="/preview-placeholder.png"
            alt="Document Preview"
            className="max-w-full max-h-[calc(100vh-100px)] object-contain select-none"
            style={{
              userSelect: "none",
              pointerEvents: "none",
              WebkitUserSelect: "none",
            }}
            width={1000}
            height={1000}
            unoptimized
          />
        </div>
      )}
<<<<<<< Updated upstream
      <iframe
        ref={iframeRef}
        src={pdfUrl}
        className={`w-full h-screen ${loading ? "hidden" : "block"}`}
        style={{ border: "none" }}
      />
=======
>>>>>>> Stashed changes
    </div>
  );
};

export default SecurePrintViewer;
