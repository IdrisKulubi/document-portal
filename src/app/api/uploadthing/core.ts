import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { documents, documentVersions } from "@/db/schema";
import { eq, max } from "drizzle-orm";
import db from "@/db/drizzle";
import { auth } from "../../../../auth";

const f = createUploadthing();

export const ourFileRouter = {
  documentUploader: f({
    pdf: { maxFileSize: "32MB" },
    text: { maxFileSize: "8MB" },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) throw new UploadThingError("Unauthorized");

      return {
        userId: session.user.id,
        documentId: metadata?.documentId,
        comment: metadata?.comment,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const [existingDoc] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, metadata.documentId || ""))
        .limit(1);

      if (existingDoc) {
        // Get the latest version number
        const [latestVersion] = await db
          .select({ version: max(documentVersions.version) })
          .from(documentVersions)
          .where(eq(documentVersions.documentId, existingDoc.id))
          .limit(1);

        const newVersion = (latestVersion?.version || 0) + 1;

        // Create new version
        await db.insert(documentVersions).values({
          documentId: existingDoc.id,
          version: newVersion,
          fileUrl: file.url,
          fileKey: file.key,
          fileSize: file.size,
          fileType: file.type,
          uploadedBy: metadata.userId,
          comment: metadata.comment,
          
        });

        // Update document with latest version
        const [document] = await db
          .update(documents)
          .set({
            fileUrl: file.url,
            fileSize: file.size,
            fileType: file.type,
            updatedAt: new Date(),
          })
          .where(eq(documents.id, existingDoc.id))
          .returning();

        return { documentId: document.id };
      } else {
        // Create new document
        const [document] = await db
          .insert(documents)
          .values({
            title: file.name,
            fileName: file.name,
            fileUrl: file.url,
            fileSize: file.size,
            fileType: file.type,
            uploadedBy: metadata.userId,
          

          })
          .returning();

        // Create initial version
        await db.insert(documentVersions).values({
          documentId: document.id,
          version: 1,
          fileUrl: file.url,
          fileKey: file.key,
          fileSize: file.size,
          fileType: file.type,
          uploadedBy: metadata.userId,
          comment: "Initial version",
        });

        return { documentId: document.id };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
