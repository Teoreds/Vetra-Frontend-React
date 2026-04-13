import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { ListPanel } from "@/shared/ui/list-panel";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { useParties } from "../hooks/use-parties";
import { PartiesTable } from "../components/parties-table";
import { PartiesFiltersBar } from "../components/parties-filters-bar";
import type { PartyListParams } from "../api/parties.api";
import { useNewPartyStore } from "../stores/use-new-party-store";

const DEFAULT_LIMIT = 20;

export function PartiesListPage() {
  const navigate = useNavigate();
  const clearPartyDraft = useNewPartyStore((s) => s.clear);
  const [filters, setFilters] = useState<PartyListParams>({
    offset: 0,
    limit: DEFAULT_LIMIT,
  });

  const { data, isLoading, refetch, isRefetching } = useParties(filters);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Anagrafiche"
        description="Gestisci clienti, fornitori, trasporti ed altro."
        badge={
          data ? (
            <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[length:var(--text-caption)] font-semibold text-primary">
              {data.total}
            </span>
          ) : undefined
        }
      />

      <ListPanel>
        <ListPanel.Toolbar
          left={
            <PartiesFiltersBar
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
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                title="Aggiorna"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              </button>
              <Button
                onClick={() => { clearPartyDraft(); navigate("/parties/new"); }}
                size="sm"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Nuova Anagrafica
              </Button>
            </>
          }
        />
        <PartiesTable parties={data?.items ?? []} isLoading={isLoading} />
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
