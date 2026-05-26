import { useState, useEffect, useRef } from "react";
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
  const searchRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim() || undefined;
      if (trimmed !== filters.search) {
        onFilterChange({ search: trimmed });
      }
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // "/" shortcut focuses search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const statusValues = filters.status_code
    ? filters.status_code.split(",").filter(Boolean)
    : [];

  const hasFilters =
    !!filters.search ||
    !!filters.status_code ||
    !!filters.date_from ||
    !!filters.date_to;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cerca ordine, cliente, articolo…"
          className="h-8 w-72 pl-9 pr-8 text-[13px]"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Date range */}
      <DateRangePicker
        from={filters.date_from}
        to={filters.date_to}
        onChange={(range) =>
          onFilterChange({ date_from: range.from, date_to: range.to })
        }
      />

      <div className="h-4 w-px bg-border shrink-0" />

      {/* Status chips */}
      <StatusMultiSelect
        value={statusValues}
        onChange={(selected) =>
          onFilterChange({
            status_code: selected.length > 0 ? selected.join(",") : undefined,
          })
        }
      />

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={() => {
            setSearchInput("");
            onReset();
          }}
          className="flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Ripristina
        </button>
      )}

    </div>
  );
}
