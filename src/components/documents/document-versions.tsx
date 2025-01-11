"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, Download, Eye } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Version {
  id: string;
  version: number;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: {
    email: string;
  };
  createdAt: Date;
  comment: string | null;
}

interface DocumentVersionsProps {
  documentId: string;
  versions: Version[];
}

export function DocumentVersions({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  documentId,
  versions,
}: DocumentVersionsProps) {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const handlePreview = async (version: Version) => {
    try {
      const response = await fetch(version.fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Error previewing version:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            Versions
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document Versions</DialogTitle>
            <DialogDescription>
              View the history of your document
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell>v{version.version}</TableCell>
                    <TableCell>{formatDate(version.createdAt)}</TableCell>
                    <TableCell>{formatBytes(version.fileSize)}</TableCell>
                    <TableCell>{version.uploadedBy.email}</TableCell>
                    <TableCell>{version.comment || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(version)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(version.fileUrl)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {previewUrl && (
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-md border">
              <iframe
                src={previewUrl}
                className="h-full w-full"
                title="Version Preview"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
