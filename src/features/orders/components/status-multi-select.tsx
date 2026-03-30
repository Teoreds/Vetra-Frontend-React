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
              "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide transition-all cursor-pointer",
              active
                ? statusBadgeVariants({ variant })
                : "border border-border/50 bg-transparent text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {s.description}
          </button>
        );
      })}
    </div>
  );
}
