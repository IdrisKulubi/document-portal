import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/db/drizzle";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;

    if (!title || !file) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Upload file to blob storage
    const blob = await put(file.name, file, {
      access: "public",
      token: process.env.BLOB_TOKEN!,
    });

    // Create document record
    const [document] = await db
      .insert(documents)
      .values({
        title: title,
        description: description,
        fileUrl: blob.url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedBy: session.user.id ?? "",
      })
      .returning();

    return NextResponse.json(document);
  } catch (error) {
    console.error("[DOCUMENT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const docs = await db
      .select()
      .from(documents)
      .where(
        session.user.role === "admin"
          ? undefined
          : eq(documents.uploadedBy, session.user.id ?? "")
      )
      .limit(limit)
      .offset(offset);

    return NextResponse.json(docs);
  } catch (error) {
    console.error("[DOCUMENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
