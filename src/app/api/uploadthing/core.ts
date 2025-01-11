import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { documents } from "@/db/schema";
import db from "@/db/drizzle";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  documentUploader: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 1 },
    text: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session?.user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // Create document record
        const [document] = await db
          .insert(documents)
          .values({
            title: file.name,
            fileUrl: file.url,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadedBy: metadata.userId ?? "",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            downloadCount: 0,
          })
          .returning();

        console.log("Upload complete for userId:", metadata.userId);
        console.log("file url", file.url);

        return { documentId: document.id };
      } catch (error) {
        console.error("Error in onUploadComplete:", error);
        throw new UploadThingError("Failed to process upload");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
