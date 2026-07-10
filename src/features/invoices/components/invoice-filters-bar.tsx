import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { INVOICE_STATUSES, INVOICE_STATUS_LABELS } from "../types/invoice-status";
import type { InvoiceListParams } from "../api/invoices.api";

interface InvoiceFiltersBarProps {
  filters: InvoiceListParams;
  onFilterChange: (filters: Partial<InvoiceListParams>) => void;
  onReset: () => void;
}

export function InvoiceFiltersBar({ filters, onFilterChange, onReset }: InvoiceFiltersBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

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

  const hasFilters =
    !!filters.search || !!filters.status_code || !!filters.date_from || !!filters.date_to;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cerca per numero..."
          className="h-9 w-52 pl-9 text-[13px]"
        />
      </div>

      <DateRangePicker
        from={filters.date_from}
        to={filters.date_to}
        onChange={(range) => onFilterChange({ date_from: range.from, date_to: range.to })}
      />

      <div className="flex flex-1 items-center gap-3 min-w-0">
        <div className="h-4 w-px bg-border/50 shrink-0" />

        <Select
          value={filters.status_code ?? ""}
          onValueChange={(val) => onFilterChange({ status_code: val || undefined })}
        >
          <SelectTrigger className="h-9 w-36 text-[13px]">
            <SelectValue placeholder="Tutti gli stati" />
          </SelectTrigger>
          <SelectContent>
            {INVOICE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {INVOICE_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            onClick={() => {
              setSearchInput("");
              onReset();
            }}
            className="ml-auto shrink-0 flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Ripristina
          </button>
        )}
      </div>
    </div>
  );
}
