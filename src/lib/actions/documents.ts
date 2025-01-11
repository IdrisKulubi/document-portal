"use server";

import db from "@/db/drizzle";
import { documents, users, documentShares } from "@/db/schema";
import { eq, desc, asc, ilike, and, count, sql, or, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type SortField = "title" | "createdAt";
export type SortOrder = "asc" | "desc";
export type DocumentStatus = "all" | "active" | "inactive";

interface GetDocumentsOptions {
  search?: string;
  status?: "active" | "inactive";
  sortBy?: "title" | "date" | "size";
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
  userId?: string;
}

export type DocumentWithUser = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  createdAt: Date;
  uploadedBy: {
    email: string;
  };
};

interface GetDocumentsResult {
  documents: DocumentWithUser[];
  totalPages: number;
  totalDocuments: number;
}

export async function getDocuments({
  search,
  status,
  sortBy = "date",
  sortOrder = "desc",
  page = 1,
  perPage = 10,
  userId,
}: GetDocumentsOptions = {}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const isAdmin = session.user.role === "admin";
  const offset = (page - 1) * perPage;

  // Build the where clause
  const whereClause = [];

  if (!isAdmin) {
    whereClause.push(eq(documents.uploadedBy, session.user.id));
  }

  if (userId && isAdmin) {
    whereClause.push(eq(documents.uploadedBy, userId));
  }

  if (status) {
    whereClause.push(eq(documents.isActive, status === "active"));
  }

  if (search) {
    whereClause.push(
      or(
        ilike(documents.title, `%${search}%`),
        ilike(documents.description || "", `%${search}%`)
      )
    );
  }

  // Build the order by clause
  const orderByClause = (() => {
    switch (sortBy) {
      case "title":
        return documents.title;
      case "size":
        return documents.fileSize;
      case "date":
      default:
        return documents.createdAt;
    }
  })();

  const [documentsResult, totalCount] = await Promise.all([
    db
      .select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        fileUrl: documents.fileUrl,
        fileType: documents.fileType,
        fileSize: documents.fileSize,
        isActive: documents.isActive,
        createdAt: documents.createdAt,
        uploadedBy: {
          id: users.id,
          email: users.email,
        },
      })
      .from(documents)
      .innerJoin(users, eq(documents.uploadedBy, users.id))
      .where(and(...whereClause))
      .orderBy(sortOrder === "desc" ? desc(orderByClause) : asc(orderByClause))
      .limit(perPage)
      .offset(offset),
    db
      .select({ count: count() })
      .from(documents)
      .where(and(...whereClause)),
  ]);

  return {
    documents: documentsResult,
    pagination: {
      total: totalCount[0].count,
      pageCount: Math.ceil(totalCount[0].count / perPage),
      page,
      perPage,
    },
  };
}

export async function deleteDocument(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [document] = await db
    .select()
    .from(documents)
    .where(
      session.user.role === "admin"
        ? eq(documents.id, id)
        : eq(documents.uploadedBy, session.user.id)
    )
    .limit(1);

  if (!document) throw new Error("Document not found");

  await db.delete(documents).where(eq(documents.id, id));
  revalidatePath("/documents");
  revalidatePath("/admin");
}

export async function getDocumentStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role !== "admin") throw new Error("Unauthorized");

  const stats = await db
    .select({
      total: count(),
      active: count(documents.isActive),
    })
    .from(documents);

  return stats[0];
}

export async function toggleDocumentStatus(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id));

  if (!document) throw new Error("Document not found");

  if (
    session.user.role !== "admin" &&
    document.uploadedBy !== session.user.id
  ) {
    throw new Error("Unauthorized");
  }

  const [updated] = await db
    .update(documents)
    .set({ isActive: !document.isActive })
    .where(eq(documents.id, id))
    .returning();

  revalidatePath("/documents");
  revalidatePath("/admin");
  return updated;
}

export async function bulkDeleteDocuments(ids: string[]) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const documents = await db
    .delete(documents)
    .where(
      and(
        session.user.role === "admin"
          ? undefined
          : eq(documents.uploadedBy, session.user.id),
        inArray(documents.id, ids)
      )
    )
    .returning();

  revalidatePath("/documents");
  revalidatePath("/admin");
  return documents;
}

export async function incrementDownloadCount(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id));

  if (!document) throw new Error("Document not found");

  if (
    session.user.role !== "admin" &&
    document.uploadedBy !== session.user.id
  ) {
    throw new Error("Unauthorized");
  }

  const [updated] = await db
    .update(documents)
    .set({
      downloadCount: sql`${documents.downloadCount} + 1`,
      lastViewedAt: new Date(),
    })
    .where(eq(documents.id, id))
    .returning();

  revalidatePath("/documents");
  revalidatePath("/admin");
  return updated;
}

interface ShareDocumentParams {
  documentId: string;
  email: string;
  expiresInDays?: number;
}

export async function shareDocument({
  documentId,
  email,
  expiresInDays = 7,
}: ShareDocumentParams) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Find the user to share with
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!targetUser) {
    throw new Error("User not found");
  }

  // Check if the document exists and the user has access to it
  const [document] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.id, documentId),
        eq(documents.uploadedBy, session.user.id)
      )
    );

  if (!document) {
    throw new Error("Document not found or access denied");
  }

  // Check if the document is already shared with this user
  const [existingShare] = await db
    .select()
    .from(documentShares)
    .where(
      and(
        eq(documentShares.documentId, documentId),
        eq(documentShares.sharedWith, targetUser.id)
      )
    );

  if (existingShare) {
    throw new Error("Document is already shared with this user");
  }

  // Create the share
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  await db.insert(documentShares).values({
    documentId,
    sharedBy: session.user.id,
    sharedWith: targetUser.id,
    expiresAt,
  });

  // Send email notification (implement this based on your email service)
  // await sendShareNotification(targetUser.email, document.title, session.user.email);

  revalidatePath("/documents");
  return true;
}
