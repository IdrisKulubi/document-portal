"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Loader2 } from "lucide-react";
import Image from "next/image";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface SecurePrintViewerProps {
  pdfUrl: string;
  watermark: string;
}

export function SecurePrintViewer({
  pdfUrl,
  watermark,
}: SecurePrintViewerProps) {
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadPDF() {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const pagesArray: HTMLCanvasElement[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 }); // Higher scale for print quality
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          // Add watermark
          context.globalAlpha = 0.3;
          context.font = "24px Arial";
          context.fillStyle = "#888";
          context.textAlign = "center";
          context.translate(viewport.width / 2, viewport.height / 2);
          context.rotate(-Math.PI / 4);
          context.fillText(watermark, 0, 0);

          pagesArray.push(canvas);
        }

        setPages(pagesArray);
        setLoading(false);

        // Trigger print after a short delay to ensure rendering
        setTimeout(() => {
          window.print();
        }, 500);
      } catch (error) {
        console.error("Error loading PDF:", error);
        window.close();
      }
    }

    loadPDF();
  }, [pdfUrl, watermark]);

  return (
    <div ref={containerRef}>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Preparing document for printing...</span>
        </div>
      ) : (
        <div className="print-container">
          {pages.map((canvas, index) => (
            <div key={index} className="page-container mb-4">
              <Image
                src={canvas.toDataURL("image/jpeg", 0.9)}
                alt={`Page ${index + 1}`}
                className="w-full"
                style={{ pageBreakAfter: "always" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
