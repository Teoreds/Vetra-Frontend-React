import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import type { ArticleListParams } from "../api/articles.api";

interface ArticlesFiltersBarProps {
  filters: ArticleListParams;
  onFilterChange: (filters: Partial<ArticleListParams>) => void;
  onReset: () => void;
}

export function ArticlesFiltersBar({
  filters,
  onFilterChange,
  onReset,
}: ArticlesFiltersBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim() || undefined;
      if (trimmed !== filters.search) {
        onFilterChange({ search: trimmed });
      }
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const hasFilters = !!filters.search;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cerca articoli..."
          className="h-9 w-56 pl-9 text-[13px]"
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => {
            setSearchInput("");
            onReset();
          }}
          className="ml-auto flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Ripristina
        </button>
      )}
    </div>
  );
}
