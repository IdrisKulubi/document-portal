import { Suspense } from "react";
import { getDocuments } from "@/lib/actions/documents";
import { DocumentSearch } from "@/components/documents/document-search";
import { DocumentFilters } from "@/components/documents/document-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentList } from "@/components/documents/document-list";

type Props = {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function DocumentsPage({ searchParams }: Props) {
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search as string | undefined;
  const sortBy = (searchParams?.sortBy as "date" | "title" | "size") || "date";
  const sortOrder = (searchParams?.sortOrder as "asc" | "desc") || "desc";
  const status = searchParams?.status as "active" | "inactive" | undefined;

  const result = await getDocuments({
    page,
    search,
    sortBy,
    sortOrder,
    status,
    perPage: 10,
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
