import { useState } from "react";
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

  const { data, isLoading } = useShippingPickNotes(filters);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold">Spedizioni</h1>
          {data && (
            <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {data.total}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Note di prelievo pronte per la spedizione. Crea i documenti di trasporto.
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <ShipmentFiltersBar
            filters={filters}
            onFilterChange={(updated) =>
              setFilters((f) => ({ ...f, ...updated, offset: 0 }))
            }
            onReset={() => setFilters({ offset: 0, limit: DEFAULT_LIMIT })}
          />
        </div>

        <ShipmentsTable pickNotes={data?.items ?? []} isLoading={isLoading} />
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
