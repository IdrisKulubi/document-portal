"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useSession } from "next-auth/react";
import { PrintButton } from "@/components/pdf/PrintButton";

interface DocumentPreviewProps {
  document: {
    id: string;
    title: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  };
  onDownload?: () => void;
}

export function DocumentPreview({
  document: doc,
  onDownload,
}: DocumentPreviewProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onDownload}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      )}

      <PrintButton documentId={doc.id} />
    </div>
  );
}
