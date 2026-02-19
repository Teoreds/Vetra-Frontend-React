import { Button } from "@/shared/ui/button";
import { ORDER_STATUSES, STATUS_LABELS } from "../types/order-status";

interface OrderFilterValues {
  status_code?: string;
  date_from?: string;
  date_to?: string;
}

interface FiltersPanelProps {
  filters: OrderFilterValues;
  onFilterChange: (filters: OrderFilterValues) => void;
  onReset: () => void;
}

export function FiltersPanel({ filters, onFilterChange, onReset }: FiltersPanelProps) {
  return (
    <div className="w-56 space-y-5 border-r border-border/40 pr-5">
      <div>
        <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Status
        </h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[13px] cursor-pointer">
            <input
              type="checkbox"
              checked={!filters.status_code}
              onChange={() => onFilterChange({ ...filters, status_code: undefined })}
              className="h-3.5 w-3.5 rounded border-border text-primary accent-primary"
            />
            All Statuses
          </label>
          {ORDER_STATUSES.map((status) => (
            <label key={status} className="flex items-center gap-2 text-[13px] cursor-pointer">
              <input
                type="checkbox"
                checked={filters.status_code === status}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    status_code: filters.status_code === status ? undefined : status,
                  })
                }
                className="h-3.5 w-3.5 rounded border-border text-primary accent-primary"
              />
              {STATUS_LABELS[status]}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Date Range
        </h3>
        <div className="space-y-2">
          <input
            type="date"
            value={filters.date_from ?? ""}
            onChange={(e) => onFilterChange({ ...filters, date_from: e.target.value || undefined })}
            className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
          />
          <input
            type="date"
            value={filters.date_to ?? ""}
            onChange={(e) => onFilterChange({ ...filters, date_to: e.target.value || undefined })}
            className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      <Button variant="link" className="px-0 text-[13px] text-primary" onClick={onReset}>
        Reset Filters
      </Button>
    </div>
  );
}
