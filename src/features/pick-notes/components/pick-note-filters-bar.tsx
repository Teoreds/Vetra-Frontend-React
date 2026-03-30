import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { useWarehouses } from "@/features/warehouses/hooks/use-warehouses";
import type { PickNoteListParams } from "../hooks/use-pick-notes";

interface PickNoteFiltersBarProps {
  filters: PickNoteListParams;
  onFilterChange: (filters: Partial<PickNoteListParams>) => void;
  onReset: () => void;
}

export function PickNoteFiltersBar({
  filters,
  onFilterChange,
  onReset,
}: PickNoteFiltersBarProps) {
  const { data: warehousesData } = useWarehouses();

  const warehouses = useMemo(
    () => warehousesData ?? [],
    [warehousesData],
  );

  // Auto-select first warehouse when data loads and none is selected
  useEffect(() => {
    if (!filters.warehouse_guid && warehouses.length > 0) {
      onFilterChange({ warehouse_guid: warehouses[0].guid });
    }
  }, [warehouses]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilters = !!filters.date_from || !!filters.date_to;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {warehouses.length > 0 && (
        <Select.Root
          value={filters.warehouse_guid ?? ""}
          onValueChange={(value) =>
            onFilterChange({ warehouse_guid: value })
          }
        >
          <Select.Trigger className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 text-[13px] font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/30">
            <Select.Value placeholder="Seleziona magazzino" />
            <Select.Icon>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              position="popper"
              sideOffset={4}
              className="z-50 max-h-60 min-w-[180px] overflow-auto rounded-xl border border-border/60 bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
            >
              <Select.Viewport>
                {warehouses.map((w) => (
                  <Select.Item
                    key={w.guid}
                    value={w.guid}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent data-[state=checked]:font-medium"
                  >
                    <Select.ItemText>
                      {w.description ?? w.guid.slice(0, 8)}
                    </Select.ItemText>
                    <Select.ItemIndicator className="ml-auto">
                      <Check className="h-3.5 w-3.5" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      )}

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
          className="ml-auto flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Ripristina
        </button>
      )}
    </div>
  );
}
