import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { TypeMultiSelect } from "./type-multi-select";
import type { PartyListParams } from "../api/parties.api";

interface PartiesFiltersBarProps {
  filters: PartyListParams;
  onFilterChange: (filters: Partial<PartyListParams>) => void;
  onReset: () => void;
}

export function PartiesFiltersBar({
  filters,
  onFilterChange,
  onReset,
}: PartiesFiltersBarProps) {
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

  const typeValues = filters.type_code
    ? filters.type_code.split(",").filter(Boolean)
    : [];

  const hasFilters = !!filters.search || !!filters.type_code;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cerca anagrafiche..."
          className="h-9 w-56 pl-9 text-[13px]"
        />
      </div>

      <div className="flex flex-1 items-center gap-3 min-w-0">
        <div className="h-4 w-px bg-border/50 shrink-0" />

        <TypeMultiSelect
          value={typeValues}
          onChange={(selected) =>
            onFilterChange({
              type_code: selected.length > 0 ? selected.join(",") : undefined,
            })
          }
        />

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
