import { getDocuments } from "@/lib/actions/documents";
import { formatDistanceToNow } from "date-fns";

export async function RecentDocuments() {
  const recentDocs = await getDocuments(1, 5);

  return (
    <div className="space-y-4">
      {recentDocs.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between border-b pb-2"
        >
          <div>
            <p className="font-medium">{doc.title}</p>
            <p className="text-sm text-muted-foreground">
              by {doc.uploadedBy.email}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(doc.createdAt)} ago
          </div>
        </div>
      ))}
    </div>
  );
}
