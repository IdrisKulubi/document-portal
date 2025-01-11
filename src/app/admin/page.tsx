import { redirect } from "next/navigation";
import { getDocumentStats } from "@/lib/actions/admin";
import { DocumentStats } from "@/components/admin/document-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { auth } from "../../../auth";

export default async function AdminPage() {
  const session = await auth();

  // Double-check authorization server-side
  if (!session?.user || !session.user.email?.endsWith(process.env.ADMIN_EMAILS!)) {
    redirect("/documents");
  }

  const stats = await getDocumentStats();

  return (
    <div className="container space-y-8 py-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Document Statistics</h2>
        <DocumentStats stats={stats} />
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {stats.recentUploads.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded by {doc.uploadedBy.email}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(doc.createdAt)} ago
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
