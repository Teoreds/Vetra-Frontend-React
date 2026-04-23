import { X } from "lucide-react";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import type { ShippingPickNoteListParams } from "../hooks/use-shipping-pick-notes";

interface ShipmentFiltersBarProps {
  filters: ShippingPickNoteListParams;
  onFilterChange: (filters: Partial<ShippingPickNoteListParams>) => void;
  onReset: () => void;
}

export function ShipmentFiltersBar({
  filters,
  onFilterChange,
  onReset,
}: ShipmentFiltersBarProps) {
  const hasFilters = !!filters.date_from || !!filters.date_to;

  return (
    <div className="flex flex-1 items-center gap-3 min-w-0">
      <DateRangePicker
        from={filters.date_from}
        to={filters.date_to}
        onChange={(range) =>
          onFilterChange({ date_from: range.from, date_to: range.to })
        }
      />

      {hasFilters && (
        <button
          onClick={onReset}
          className="ml-auto shrink-0 flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Ripristina
        </button>
      )}
    </div>
  );
}
