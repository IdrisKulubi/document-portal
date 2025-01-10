import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { documents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { del } from "@vercel/blob";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const document = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.id, params.id),
          session.user.role === "admin"
            ? undefined
            : eq(documents.uploadedBy, session.user.id)
        )
      )
      .limit(1);

    if (!document[0]) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Delete from blob storage
    await del(document[0].fileUrl);

    // Delete from database
    await db.delete(documents).where(eq(documents.id, params.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DOCUMENT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
