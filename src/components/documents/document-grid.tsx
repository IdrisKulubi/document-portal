"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentActions } from "./document-actions";
import { formatDistanceToNow } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { bulkDeleteDocuments } from "@/lib/actions/documents";

type Document = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  createdAt: Date;
  isActive: boolean;
  uploadedBy: {
    email: string;
  };
  fileType: string;
  fileSize: number;
};

interface DocumentGridProps {
  documents: Document[];
}

export function DocumentGrid({ documents }: DocumentGridProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleDocument = (id: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDocs(newSelected);
  };

  const toggleAll = () => {
    if (selectedDocs.size === documents.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(documents.map((doc) => doc.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedDocs.size) return;

    setIsDeleting(true);
    try {
      await bulkDeleteDocuments(Array.from(selectedDocs));
      toast({
        title: "Success",
        description: "Selected documents deleted successfully",
      });
      router.refresh();
      setSelectedDocs(new Set());
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete selected documents",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {selectedDocs.size > 0 && (
        <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedDocs.size === documents.length}
              onCheckedChange={toggleAll}
            />
            <span className="text-sm">
              {selectedDocs.size} document{selectedDocs.size === 1 ? "" : "s"}{" "}
              selected
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isDeleting}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => (
          <Card key={document.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedDocs.has(document.id)}
                  onCheckedChange={() => toggleDocument(document.id)}
                />
                <CardTitle className="text-base font-medium">
                  {document.title}
                </CardTitle>
              </div>
              <DocumentActions document={document} />
            </CardHeader>
            <CardContent>
              {document.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {document.description}
                </p>
              )}
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span>
                  Uploaded {formatDistanceToNow(document.createdAt)} ago by{" "}
                  {document.uploadedBy.email}
                </span>
                <span
                  className={
                    document.isActive ? "text-green-600" : "text-red-600"
                  }
                >
                  Status: {document.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
