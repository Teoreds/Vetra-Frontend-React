import { useState, useRef, useCallback } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "@/shared/ui/button";
import { useArticles } from "@/features/articles/hooks/use-articles";
import type { ArticleOut } from "@/features/articles/types/article.types";
import { cn } from "@/shared/lib/utils";

interface ArticleSearchPopoverProps {
  onSelect: (article: ArticleOut) => void;
}

export function ArticleSearchPopover({ onSelect }: ArticleSearchPopoverProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useArticles(
    search.trim().length >= 2 ? { search: search.trim(), limit: 30 } : { limit: 30 },
  );
  const articles = data?.items ?? [];

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (next) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, []);

  function handleSelect(article: ArticleOut) {
    onSelect(article);
    handleOpenChange(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-3.5 w-3.5" />
          Aggiungi articolo
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-50 w-80 rounded-xl border border-border/60 bg-popover shadow-lg outline-none"
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca per codice o descrizione…"
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60"
            />
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          </div>

          {/* Results list */}
          <div className="max-h-60 overflow-y-auto py-1">
            {articles.length === 0 && !isLoading && (
              <p className="px-3 py-4 text-center text-[13px] text-muted-foreground">
                {search.length >= 2 ? "Nessun articolo trovato." : "Digita per cercare articoli."}
              </p>
            )}
            {articles.map((article) => (
              <button
                key={article.guid}
                type="button"
                onClick={() => handleSelect(article)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent",
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-[10px] font-bold text-primary">
                  {article.code.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{article.description}</p>
                  <p className="text-[11px] text-muted-foreground">{article.code}</p>
                </div>
              </button>
            ))}
          </div>

          <Popover.Arrow className="fill-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
