"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";

export default function PrintHandler({ printToken }: { printToken: string }) {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPrinting, setIsPrinting] = useState(false);

  // Listen for actual print attempt
  useEffect(() => {
    const beforePrint = () => setIsPrinting(true);
    const afterPrint = () => setIsPrinting(false);

    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);

    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

  const handlePrint = async () => {
    try {
      setLoading(true);

      // First get the preview image
      const response = await fetch("/api/print/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printToken, mode: "preview" }),
      });

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);

      // Create print window with preview image
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <body style="margin:0">
              <img src="${imageUrl}" style="width:100%" id="preview" />
              <div id="printContent" style="display:none"></div>
            </body>
            <script>
              window.addEventListener('beforeprint', async () => {
                // Replace preview with actual PDF content when printing starts
                const response = await fetch("/api/print/request", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    printToken: "${printToken}",
                    mode: "print"
                  })
                });
                const pdfBlob = await response.blob();
                const pdfUrl = URL.createObjectURL(pdfBlob);
                document.body.innerHTML = \`
                  <iframe src="\${pdfUrl}" style="width:100%;height:100vh;border:none;"></iframe>
                \`;
              });
            </script>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();

        printWindow.onafterprint = () => {
          printWindow.close();
          URL.revokeObjectURL(imageUrl);
        };
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePrint} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Printer className="h-4 w-4 mr-2" />
      )}
      {loading ? "Processing..." : "Print Document"}
    </Button>
  );
}
