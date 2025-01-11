import { Suspense } from "react";
import { getDocuments } from "@/lib/actions/documents";
import { DocumentSearch } from "@/components/documents/document-search";
import { DocumentFilters } from "@/components/documents/document-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentList } from "@/components/documents/document-list";

export default async function DocumentsPage() {
  const result = await getDocuments({
    page: 1,
  });

  return (
    <div className="container py-8">
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <DocumentSearch />
          </div>
          <DocumentFilters />
        </div>
        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <DocumentList {...result} />
        </Suspense>
      </div>
    </div>
  );
}
