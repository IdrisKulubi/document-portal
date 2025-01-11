import { Suspense } from "react";
import { getDocuments } from "@/lib/actions/documents";
import { DocumentSearch } from "@/components/documents/document-search";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentUploadButton } from "@/components/documents/document-upload-button";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentList } from "@/components/documents/document-list";

interface DocumentsPageProps {
  searchParams: {
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  };
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const { search, status, sortBy, sortOrder, page } = await Promise.resolve(
    searchParams
  );

  const result = await getDocuments({
    search,
    status: status as "active" | "inactive",
    sortBy: sortBy as "title" | "date" | "size",
    sortOrder: sortOrder as "asc" | "desc",
    page: Number(page) || 1,
  });

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Documents</h1>
        <DocumentUploadButton />
      </div>

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
