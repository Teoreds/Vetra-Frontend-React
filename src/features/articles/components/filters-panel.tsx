import { Button } from "@/shared/ui/button";

interface ArticleFilterValues {
  search?: string;
}

interface FiltersPanelProps {
  filters: ArticleFilterValues;
  onFilterChange: (filters: ArticleFilterValues) => void;
  onReset: () => void;
}

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
          placeholder="Cerca articoli..."
          className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <Button variant="link" className="px-0 text-[13px] text-primary" onClick={onReset}>
        Resetta filitri
      </Button>
    </div>
  );
}
