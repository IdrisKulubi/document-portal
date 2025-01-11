"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { useUploadThing } from "@/lib/uploadthing";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  file: z.any().refine((file) => file && file.size > 0, {
    message: "File is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function DocumentUploadForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const { startUpload } = useUploadThing("documentUploader");

  const onSubmit = async (data: FormValues) => {
    setIsUploading(true);
    try {
      const uploadResult = await startUpload(data.file);

      if (!uploadResult) {
        throw new Error("Upload failed");
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      router.refresh();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter document title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter document description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <UploadButton
          endpoint="documentUploader"
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onClientUploadComplete={(res) => {
            toast({
              title: "Upload completed",
              description: "Document has been uploaded successfully",
            });
            router.refresh();
          }}
          onUploadError={(error: Error) => {
            toast({
              title: "Error uploading file",
              description: error.message,
              variant: "destructive",
            });
          }}
        />

        <Button type="submit" className="w-full" disabled={isUploading}>
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Upload Document
        </Button>
      </form>
    </Form>
  );
}
