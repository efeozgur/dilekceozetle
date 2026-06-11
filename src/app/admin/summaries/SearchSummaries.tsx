"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchSummariesProps {
  initialSearch: string;
}

export function SearchSummaries({ initialSearch }: SearchSummariesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/admin/summaries?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Metin veya email ara..."
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
      {search && (
        <button
          type="button"
          onClick={() => { setSearch(""); const params = new URLSearchParams(searchParams.toString()); params.delete("search"); params.delete("page"); router.push(`/admin/summaries?${params.toString()}`); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
