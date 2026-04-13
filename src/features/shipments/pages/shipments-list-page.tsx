import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";
import { ListPanel } from "@/shared/ui/list-panel";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { useShippingPickNotes, type ShippingPickNoteListParams } from "../hooks/use-shipping-pick-notes";
import { ShipmentsTable } from "../components/shipments-table";
import { ShipmentFiltersBar } from "../components/shipment-filters-bar";

const DEFAULT_LIMIT = 20;

export function ShipmentsListPage() {
  const [filters, setFilters] = useState<ShippingPickNoteListParams>({
    offset: 0,
    limit: DEFAULT_LIMIT,
  });

  const { data, isLoading, refetch, isRefetching } = useShippingPickNotes(filters);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Spedizioni"
        description="Note di prelievo pronte per la spedizione. Crea i documenti di trasporto."
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
            <ShipmentFiltersBar
              filters={filters}
              onFilterChange={(updated) =>
                setFilters((f) => ({ ...f, ...updated, offset: 0 }))
              }
              onReset={() => setFilters({ offset: 0, limit: DEFAULT_LIMIT })}
            />
          }
          right={
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              title="Aggiorna"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            </button>
          }
        />
        <ShipmentsTable pickNotes={data?.items ?? []} isLoading={isLoading} />
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
