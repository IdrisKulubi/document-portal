/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type User = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date | null;
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
    throw new Error("You are not authorized to update users");
  }

  if (userId === session.user.id && data.role !== "admin") {
    throw new Error("You cannot remove your own admin privileges");
  }

  try {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();

    revalidatePath("/admin");
    return {
      success: true,
      message: `User ${data.role ? "role" : "status"} updated successfully`,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user. Please try again.");
  }
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

export async function addUser(email: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You are not authorized to add users");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("This email is already registered");
  }

  try {
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name: email.split("@")[0],
        role: "user",
        isActive: true,
      })
      .returning();

    revalidatePath("/admin");
    return { success: true, message: "User added successfully" };
  } catch (error) {
    throw new Error("Failed to add user. Please try again.");
  }
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You are not authorized to delete users");
  }

  if (userId === session.user.id) {
    throw new Error("You cannot delete your own account");
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin");
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    throw new Error("Failed to delete user. Please try again.");
  }
}

export async function updateUserAdmin(
  userId: string,
  data: { role?: string; isActive?: boolean }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  if (userId === session.user.id && data.role !== "admin") {
    throw new Error("Cannot demote yourself");
  }

  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...(data.role !== undefined && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      })
      .where(eq(users.id, userId))
      .returning();

    revalidatePath("/admin");
    return {
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    throw new Error("Failed to update user");
  }
}
