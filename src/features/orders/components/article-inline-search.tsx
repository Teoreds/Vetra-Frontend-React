import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { useArticles } from "@/features/articles/hooks/use-articles";
import type { ArticleOut } from "@/features/articles/types/article.types";
import { cn } from "@/shared/lib/utils";

interface ArticleInlineSearchProps {
  onSelect: (article: ArticleOut) => void;
}

export function ArticleInlineSearch({ onSelect }: ArticleInlineSearchProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useArticles(
    search.trim().length >= 1 ? { search: search.trim(), limit: 20 } : { limit: 20 },
  );
  const articles = data?.items ?? [];

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Reset focused index when results change
  useEffect(() => {
    setFocusedIndex(0);
  }, [articles.length]);

  const confirmSelection = useCallback(
    (article: ArticleOut) => {
      onSelect(article);
      setSearch("");
      setOpen(false);
      inputRef.current?.focus();
    },
    [onSelect],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") setOpen(true);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, articles.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (articles[focusedIndex]) confirmSelection(articles[focusedIndex]);
        break;
      case "Escape":
        setOpen(false);
        setSearch("");
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input bar */}
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-lg border bg-background px-3 py-2 transition-all",
          open
            ? "border-primary ring-2 ring-ring/20"
            : "border-border/60 hover:border-border",
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Aggiungi articolo…"
          className="article-search-input flex-1 bg-transparent text-[13px] outline-none focus:outline-none focus-visible:outline-none placeholder:text-muted-foreground/60"
        />
        {open && search && (
          <button
            type="button"
            onClick={() => { setSearch(""); setOpen(false); }}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Esc
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border bg-popover shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          {articles.length === 0 && !isLoading && (
            <p className="px-3 py-4 text-center text-[13px] text-muted-foreground">
              {search.trim().length >= 1
                ? "Nessun articolo trovato."
                : "Digita per cercare articoli."}
            </p>
          )}
          {articles.map((article, index) => (
            <button
              key={article.guid}
              type="button"
              onMouseDown={(e) => {
                // Use mousedown so it fires before the outside-click handler
                e.preventDefault();
                confirmSelection(article);
              }}
              onMouseEnter={() => setFocusedIndex(index)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                index === focusedIndex ? "bg-accent" : "hover:bg-accent/60",
              )}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-[10px] font-bold text-primary">
                {article.code.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{article.description}</p>
                <p className="text-[11px] text-muted-foreground">{article.code}</p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">↵</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
