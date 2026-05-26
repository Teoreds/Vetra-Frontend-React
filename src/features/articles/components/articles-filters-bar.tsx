import { useState, useEffect, useRef } from "react";
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
  const searchRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasFilters = !!filters.search;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cerca articoli…"
          className="h-8 w-72 pl-9 pr-8 text-[13px]"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {hasFilters && (
        <button
          onClick={() => { setSearchInput(""); onReset(); }}
          className="flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Ripristina
        </button>
      )}
    </div>
  );
}
