"use server";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type User = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

export async function getUsers() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return allUsers;
}

export async function updateUser(
  userId: string,
  data: { role?: string; isActive?: boolean }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Prevent self-demotion
  if (userId === session.user.id && data.role !== "admin") {
    throw new Error("Cannot demote yourself");
  }

  const [updatedUser] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning();

  revalidatePath("/admin");
  return updatedUser;
}

export async function getUserStats() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const stats = await db
    .select({
      total: count(),
      active: count(users.isActive),
    })
    .from(users);

  return stats[0];
}
