"use client";

import { DocumentActions } from "./document-actions";

interface DocumentListProps {
  documents: Array<{
    id: string;
    title: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    isActive: boolean;
    uploadedBy: {
      email: string;
    };
  }>;
}

export function DocumentList({ documents }: DocumentListProps) {
  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div>
            <h3 className="font-medium">{document.title}</h3>
            <p className="text-sm text-muted-foreground">
              Uploaded by {document.uploadedBy.email}
            </p>
          </div>
          <DocumentActions document={document} />
        </div>
      ))}
    </div>
  );
}
