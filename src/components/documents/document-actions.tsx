"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DocumentPreview } from "./document-preview";
import { DocumentShare } from "./document-share";
import { deleteDocument, toggleDocumentStatus } from "@/lib/actions/documents";
import { useToast } from "@/hooks/use-toast";

interface DocumentActionsProps {
  document: {
    id: string;
    title: string;
    fileUrl: string;
    isActive: boolean;
    uploadedBy: {
      email: string;
    };
    fileType: string;
    fileSize: number;
  };
}

export function DocumentActions({ document: doc }: DocumentActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!isAdmin) return;

    try {
      const response = await fetch(doc.fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteDocument(doc.id);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DocumentPreview document={doc} onDownload={handleDownload} />
      <DocumentShare documentId={doc.id} />
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={async () => {
                await toggleDocumentStatus(doc.id);
                router.refresh();
              }}
            >
              {doc.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isLoading}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
