import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserStats } from "@/lib/actions/users";
import { getDocumentStats } from "@/lib/actions/documents";

export async function AdminStats() {
  const [userStats, documentStats] = await Promise.all([
    getUserStats(),
    getDocumentStats(),
  ]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.total}</div>
          <p className="text-xs text-muted-foreground">
            {userStats.active} active users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{documentStats.total}</div>
          <p className="text-xs text-muted-foreground">
            {documentStats.active} active documents
          </p>
        </CardContent>
      </Card>
    </>
  );
}
