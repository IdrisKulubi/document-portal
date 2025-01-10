import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { role, isActive } = body;

    if (role === undefined && isActive === undefined) {
      return new NextResponse("No fields to update", { status: 400 });
    }

    // Prevent self-demotion
    if (params.id === session.user.id && role !== "admin") {
      return new NextResponse("Cannot demote yourself", { status: 400 });
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
      })
      .where(eq(users.id, params.id))
      .returning();

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
