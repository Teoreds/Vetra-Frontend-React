import { Button } from "@/shared/ui/button";

interface PartyFilterValues {
  type_code?: string;
  search?: string;
}

interface FiltersPanelProps {
  filters: PartyFilterValues;
  onFilterChange: (filters: PartyFilterValues) => void;
  onReset: () => void;
}

const PARTY_TYPES = ["CUSTOMER", "SUPPLIER", "CARRIER"] as const;

export function FiltersPanel({ filters, onFilterChange, onReset }: FiltersPanelProps) {
  return (
    <div className="w-56 space-y-5 border-r border-border/40 pr-5">
      <div>
        <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Cerca
        </h3>
        <input
          type="text"
          value={filters.search ?? ""}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value || undefined })}
          placeholder="Cerca anagrafiche..."
          className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div>
        <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tipo
        </h3>
        <div className="space-y-1.5">
          {PARTY_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-[13px] cursor-pointer">
              <input
                type="radio"
                name="type_code"
                checked={filters.type_code === type}
                onChange={() => onFilterChange({ ...filters, type_code: type })}
                className="h-3.5 w-3.5 border-border text-primary accent-primary"
              />
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </label>
          ))}
        </div>
      </div>

      <Button variant="link" className="px-0 text-[13px] text-primary" onClick={onReset}>
        Resetta Filtri
      </Button>
    </div>
  );
}
