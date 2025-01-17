"use client";

import { useEffect, useState, use } from "react";
import { SecurePrintViewer } from "@/components/pdf/SecurePrintViewer";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function PrintViewer(props: PageProps) {
  const params = use(props.params);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const token = params.token;

  useEffect(() => {
    const getPrintAccess = async () => {
      try {
        const response = await fetch("/api/print/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            printToken: token,
            status: "printing",
          }),
        });

        if (!response.ok) throw new Error("Failed to get print access");
        const { printAccessToken } = await response.json();
        setPdfUrl(`/api/print/view/${printAccessToken}`);
      } catch (error) {
        console.error("Error getting print access:", error);
        window.close();
      }
    };

    getPrintAccess();
  }, [token]);

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg mb-4">Preparing document for printing...</p>
      </div>
    );
  }

  return (
    <SecurePrintViewer
      pdfUrl={pdfUrl}
      watermark={`Printed by ${new Date().toLocaleString()}`}
    />
  );
}
