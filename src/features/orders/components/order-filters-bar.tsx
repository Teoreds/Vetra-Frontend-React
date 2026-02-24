import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { StatusMultiSelect } from "./status-multi-select";
import type { OrderListParams } from "../api/orders.api";

interface OrderFiltersBarProps {
  filters: OrderListParams;
  onFilterChange: (filters: Partial<OrderListParams>) => void;
  onReset: () => void;
}

export function OrderFiltersBar({
  filters,
  onFilterChange,
  onReset,
}: OrderFiltersBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim() || undefined;
      if (trimmed !== filters.search) {
        onFilterChange({ search: trimmed });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const statusValues = filters.status_code
    ? filters.status_code.split(",").filter(Boolean)
    : [];

  const hasFilters =
    !!filters.search ||
    !!filters.status_code ||
    !!filters.date_from ||
    !!filters.date_to;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cerca ordini..."
          className="h-9 w-56 pl-9 text-[13px]"
        />
      </div>

      <StatusMultiSelect
        value={statusValues}
        onChange={(selected) =>
          onFilterChange({
            status_code: selected.length > 0 ? selected.join(",") : undefined,
          })
        }
      />

      <DateRangePicker
        from={filters.date_from}
        to={filters.date_to}
        onChange={(range) =>
          onFilterChange({ date_from: range.from, date_to: range.to })
        }
      />

      {hasFilters && (
        <button
          onClick={() => {
            setSearchInput("");
            onReset();
          }}
          className="ml-auto flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Ripristina
        </button>
      )}
    </div>
  );
}
