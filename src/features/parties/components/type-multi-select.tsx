import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { usePartyTypes } from "@/shared/hooks/use-lookups";
import { statusBadgeVariants, type StatusBadgeVariant } from "@/shared/ui/status-badge";

const TYPE_VARIANT: Record<string, StatusBadgeVariant> = {
  CUSTOMER: "customer",
  SUPPLIER: "supplier",
  CARRIER: "carrier",
};

interface TypeMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function TypeMultiSelect({ value, onChange }: TypeMultiSelectProps) {
  const { data: partyTypes } = usePartyTypes();

  function toggle(type: string) {
    if (value.includes(type)) {
      onChange(value.filter((t) => t !== type));
    } else {
      onChange([...value, type]);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {partyTypes.map((pt) => {
        const active = value.includes(pt.code);
        const variant = TYPE_VARIANT[pt.code] ?? "default";
        return (
          <button
            key={pt.code}
            type="button"
            onClick={() => toggle(pt.code)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide transition-all cursor-pointer",
              active
                ? cn(statusBadgeVariants({ variant }), "ring-1 ring-current/30 shadow-sm")
                : "border border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/50",
            )}
          >
            {active && <Check className="h-2.5 w-2.5 stroke-[3]" />}
            {pt.description}
          </button>
        );
      })}
    </div>
  );
}
