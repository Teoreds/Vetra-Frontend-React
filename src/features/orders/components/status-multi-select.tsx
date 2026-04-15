import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useOrderStatuses } from "@/shared/hooks/use-lookups";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { statusBadgeVariants } from "@/shared/ui/status-badge";

interface StatusMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function StatusMultiSelect({ value, onChange }: StatusMultiSelectProps) {
  const { data: orderStatuses } = useOrderStatuses();

  function toggle(status: string) {
    if (value.includes(status)) {
      onChange(value.filter((s) => s !== status));
    } else {
      onChange([...value, status]);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {orderStatuses.map((s) => {
        const active = value.includes(s.code);
        const variant = getStatusVariant(s.code);
        return (
          <button
            key={s.code}
            type="button"
            onClick={() => toggle(s.code)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide transition-all cursor-pointer",
              active
                ? cn(statusBadgeVariants({ variant }), "ring-1 ring-current/30 shadow-sm")
                : "border border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/50",
            )}
          >
            {active && <Check className="h-2.5 w-2.5 stroke-[3]" />}
            {s.description}
          </button>
        );
      })}
    </div>
  );
}
