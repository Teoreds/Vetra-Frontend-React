import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { useParties } from "../hooks/use-parties";
import { PartiesTable } from "../components/parties-table";
import { PartiesFiltersBar } from "../components/parties-filters-bar";
import type { PartyListParams } from "../api/parties.api";

const DEFAULT_LIMIT = 20;

export function PartiesListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PartyListParams>({
    offset: 0,
    limit: DEFAULT_LIMIT,
  });

  const { data, isLoading } = useParties(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold">Anagrafiche</h1>
            {data && (
              <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {data.total}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Gestisci clienti, fornitori, trasporti ed altro.</p>
        </div>
        <Button onClick={() => navigate("/parties/new")}>
          <Plus className="mr-1 h-4 w-4" />
          Nuova Anagrafica
        </Button>
      </div>

      <PartiesFiltersBar
        filters={filters}
        onFilterChange={(updated) =>
          setFilters((f) => ({ ...f, ...updated, offset: 0 }))
        }
        onReset={() => setFilters({ offset: 0, limit: DEFAULT_LIMIT })}
      />

      <div className="rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <PartiesTable parties={data?.items ?? []} isLoading={isLoading} />
        {data && data.total > 0 && (
          <PaginationControls
            total={data.total}
            offset={data.offset}
            limit={data.limit}
            onPageChange={(offset) => setFilters((f) => ({ ...f, offset }))}
          />
        )}
      </div>
    </div>
  );
}
