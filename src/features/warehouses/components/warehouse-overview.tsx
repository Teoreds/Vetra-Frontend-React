import type { WarehouseOut } from "../types/warehouse.types";

interface WarehouseOverviewProps {
  warehouse: WarehouseOut;
}

export function WarehouseOverview({ warehouse }: WarehouseOverviewProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Warehouse Details
      </h3>
      <dl className="space-y-2.5">
        <div className="flex justify-between">
          <dt className="text-[13px] text-muted-foreground">Name</dt>
          <dd className="text-[13px] font-medium">{warehouse.description}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[13px] text-muted-foreground">Location</dt>
          <dd className="text-[13px] font-medium font-mono">
            {warehouse.location_guid?.slice(0, 8) ?? "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
