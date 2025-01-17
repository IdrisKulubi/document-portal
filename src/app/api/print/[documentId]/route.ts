import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/db/drizzle";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.PRINT_TOKEN_SECRET!);

async function getDocumentById(id: string) {
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);
  return document;
}

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const documentId = params.documentId;
    const document = await getDocumentById(documentId);

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Create a short-lived token (5 minutes) for secure printing
    const token = await new SignJWT({
      documentId: document.id,
      fileUrl: document.fileUrl,
      action: "print",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("5m")
      .sign(secret);

    return NextResponse.json({ printUrl: `/api/print/view/${token}` });
  } catch (error) {
    console.error("[PRINT_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
