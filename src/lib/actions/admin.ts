"use server";

import db from "@/db/drizzle";
import { documents, users } from "@/db/schema";
import { eq, and, count, sql, desc } from "drizzle-orm";
import { auth } from "@/auth";

export async function getDocumentStats() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const [
    totalDocumentsResult,
    totalDownloadsResult,
    activeUsersResult,
    recentUploads,
  ] = await Promise.all([
    db.select({ count: count() }).from(documents),
    db
      .select({
        total: sql<number>`sum(${documents.downloadCount})`,
      })
      .from(documents),
    db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.isActive, true),
          sql`exists (
            select 1 from ${documents}
            where ${documents.uploadedBy} = ${users.id}
          )`
        )
      ),
    db
      .select({
        id: documents.id,
        title: documents.title,
        createdAt: documents.createdAt,
        uploadedBy: {
          email: users.email,
        },
      })
      .from(documents)
      .innerJoin(users, eq(documents.uploadedBy, users.id))
      .orderBy(desc(documents.createdAt))
      .limit(5),
  ]);

  return {
    totalDocuments: totalDocumentsResult[0].count,
    totalDownloads: totalDownloadsResult[0].total || 0,
    activeUsers: activeUsersResult[0].count,
    recentUploads,
  };
}
