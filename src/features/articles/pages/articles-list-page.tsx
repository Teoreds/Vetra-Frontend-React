import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { ListPanel } from "@/shared/ui/list-panel";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { useArticles } from "../hooks/use-articles";
import { ArticlesTable } from "../components/articles-table";
import { ArticlesFiltersBar } from "../components/articles-filters-bar";
import type { ArticleListParams } from "../api/articles.api";

const DEFAULT_LIMIT = 20;

export function ArticlesListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ArticleListParams>({
    offset: 0,
    limit: DEFAULT_LIMIT,
  });

  const { data, isLoading, refetch, isRefetching } = useArticles(filters);

  const hasActiveFilters = !!filters.search;
  const baseTotalRef = useRef<number | null>(null);
  const [baseTotal, setBaseTotal] = useState<number | null>(null);
  useEffect(() => {
    if (!hasActiveFilters && data?.total != null) {
      baseTotalRef.current = data.total;
      setBaseTotal(data.total);
    }
  }, [data?.total, hasActiveFilters]);

  const badgeText =
    data != null
      ? hasActiveFilters && baseTotal != null
        ? `${data.total} di ${baseTotal}`
        : String(data.total)
      : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Articoli"
        description="Gestisci il catalogo articoli."
        badge={
          badgeText != null ? (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[length:var(--text-caption)] font-semibold text-primary-text">
              {badgeText}
            </span>
          ) : undefined
        }
      />

      <ListPanel>
        <ListPanel.Toolbar
          left={
            <ArticlesFiltersBar
              filters={filters}
              onFilterChange={(updated) =>
                setFilters((f) => ({ ...f, ...updated, offset: 0 }))
              }
              onReset={() => setFilters({ offset: 0, limit: DEFAULT_LIMIT })}
            />
          }
          right={
            <>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isRefetching}
                title="Aggiorna"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              </button>
              <Button onClick={() => navigate("/articles/new")} size="sm">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Nuovo Articolo
              </Button>
            </>
          }
        />
        <ArticlesTable articles={data?.items ?? []} isLoading={isLoading} />
        {data && data.total > 0 && (
          <PaginationControls
            total={data.total}
            offset={data.offset}
            limit={data.limit}
            onPageChange={(offset) => setFilters((f) => ({ ...f, offset }))}
          />
        )}
      </ListPanel>
    </div>
  );
}
