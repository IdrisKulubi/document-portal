"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Share,
  Copy,
  Loader2,
  
} from "lucide-react";
import { FaWhatsapp, FaLinkedin, FaTwitter } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

interface DocumentShareProps {
  documentId: string;
  documentUrl: string;
}

export function DocumentShare({ documentUrl }: DocumentShareProps) {
  const [open, setOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(documentUrl);
      toast({
        title: "Success",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      console.error("Error copying link:", error);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  const shareToSocial = (platform: "whatsapp" | "linkedin" | "twitter") => {
    const text = encodeURIComponent("Check out this document!");
    const url = encodeURIComponent(documentUrl);

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    };

    window.open(shareUrls[platform], "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Share this document via link or social media
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input readOnly value={documentUrl} className="flex-1" />
            <Button
              variant="secondary"
              size="icon"
              onClick={handleCopyLink}
              disabled={copying}
            >
              {copying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => shareToSocial("whatsapp")}
            >
              <FaWhatsapp className="h-5 w-5 text-green-600" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => shareToSocial("linkedin")}
            >
              <FaLinkedin className="h-5 w-5 text-blue-600" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => shareToSocial("twitter")}
            >
              <FaTwitter className="h-5 w-5 text-sky-500" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
