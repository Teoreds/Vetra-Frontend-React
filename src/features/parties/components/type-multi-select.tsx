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
              "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide transition-all cursor-pointer",
              active
                ? statusBadgeVariants({ variant })
                : "border border-border/50 bg-transparent text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {pt.description}
          </button>
        );
      })}
    </div>
  );
}
