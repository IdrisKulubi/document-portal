import { redirect } from "next/navigation";
import { getDocumentStats } from "@/lib/actions/admin";
import { DocumentStats } from "@/components/admin/document-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { auth } from "../../../auth";
import { DocumentUploadButton } from "@/components/documents/document-upload-button";
import { getUsers } from "@/lib/actions/users";
import { AddUserForm } from "@/components/admin/add-user-form";
import { UserList } from "@/components/admin/user-list";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/documents");
  }

  const stats = await getDocumentStats();
  const users = await getUsers();

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <DocumentUploadButton />
        </div>
        <DocumentStats stats={stats} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Card>
          <CardHeader>
            <CardTitle>Add Authorized User</CardTitle>
          </CardHeader>
          <CardContent>
            <AddUserForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Existing Users</CardTitle>
          </CardHeader>
          <CardContent>
            <UserList users={users} />
          </CardContent>
        </Card>
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
