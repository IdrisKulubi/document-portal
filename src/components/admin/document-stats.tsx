"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Users, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type DocumentStats = {
  totalDocuments: number;
  totalDownloads: number;
  activeUsers: number;
  recentUploads: {
    id: string;
    title: string;
    uploadedBy: { email: string };
    createdAt: Date | null;
  }[];
};

export function DocumentStats({ stats }: { stats: DocumentStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          <p className="text-xs text-muted-foreground">
            Documents in the system
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
          <Download className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDownloads}</div>
          <p className="text-xs text-muted-foreground">Across all documents</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            Users with uploaded documents
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.recentUploads.slice(0, 3).map((doc) => (
              <div key={doc.id} className="text-xs">
                <span className="font-medium">{doc.uploadedBy.email}</span>{" "}
                uploaded <span className="font-medium">{doc.title}</span>{" "}
                {doc.createdAt ? formatDistanceToNow(doc.createdAt) : "N/A"} ago
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
