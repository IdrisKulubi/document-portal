"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export function DocumentSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("search") || "");
  const debouncedValue = useDebounce(value, 500);

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (term) {
        params.set("search", term);
      } else {
        params.delete("search");
      }

      params.delete("page"); // Reset pagination
      startTransition(() => {
        router.push(`/documents?${params.toString()}`);
        router.refresh(); // Force refresh
      });
    },
    [router, searchParams]
  );

  useEffect(() => {
    handleSearch(debouncedValue);
  }, [debouncedValue, handleSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search documents..."
        className="pl-8 pr-8"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-7 w-7 p-0"
          onClick={() => {
            setValue("");
            handleSearch("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
