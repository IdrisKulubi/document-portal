"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export function DocumentSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("search") || "");
  const debouncedValue = useDebounce(value, 500);

  const createQueryString = useCallback(
    (params: { [key: string]: string | null }) => {
      const current = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });
      return current.toString();
    },
    [searchParams]
  );

  const handleSearch = useCallback(
    (searchTerm: string) => {
      startTransition(() => {
        const queryString = createQueryString({
          search: searchTerm || null,
          page: null,
        });
        router.push(`/documents?${queryString}`);
      });
    },
    [router, createQueryString]
  );

  // Update search when debounced value changes
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
      <div
        className={cn(
          "absolute inset-0 rounded-md bg-white/50",
          isPending ? "block" : "hidden"
        )}
      />
    </div>
  );
}
