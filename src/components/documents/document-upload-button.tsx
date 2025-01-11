"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

export function DocumentUploadButton() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to your library. Supported formats: PDF, TXT
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <UploadButton
            endpoint="documentUploader"
            onClientUploadComplete={(res) => {
              if (res) {
                console.log("Files: ", res);
                toast({
                  title: "Success",
                  description: "Document uploaded successfully",
                });
                setOpen(false);
                router.refresh();
              }
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error);
              toast({
                variant: "destructive",
                description: `Upload failed: ${error.message}`,
              });
            }}
            appearance={{
              button: "ut-ready:bg-primary ut-ready:text-primary-foreground",
              allowedContent: "text-muted-foreground text-xs",
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
