"use server";

import { put } from "@vercel/blob";
import db from "@/db/drizzle";
import { documents } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function uploadDocument(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const title = formData.get("title") as string | undefined;
  const description = formData.get("description") as string | null;
  const file = formData.get("file") as File | undefined;

  if (!title || !file) {
    throw new Error("Missing required fields");
  }

  // Upload file to blob storage
  const blob = await put(file.name, file, {
    access: "public",
    token: process.env.BLOB_TOKEN!,
  });

  console.log(blob);

  // Create document record
  const [document] = await db
    .insert(documents)
    .values({
      title: title,
      description: description ?? null,
      fileUrl: blob.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedBy: session.user.id ?? "",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      downloadCount: 0,
    })
    .returning();

  revalidatePath("/documents");
  revalidatePath("/admin");
  return document;
}
