import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ORDER_STATUSES, STATUS_LABELS } from "../types/order-status";

interface StatusMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function StatusMultiSelect({ value, onChange }: StatusMultiSelectProps) {
  const [open, setOpen] = useState(false);

  function toggle(status: string) {
    if (value.includes(status)) {
      onChange(value.filter((s) => s !== status));
    } else {
      onChange([...value, status]);
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-background px-3 text-[13px] outline-none transition-all whitespace-nowrap",
            "hover:border-border focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20 data-[state=open]:border-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-ring/20",
            value.length === 0 && "text-muted-foreground/70",
          )}
        >
          <span>
            {value.length === 0
              ? "Tutti gli stati"
              : `Stato (${value.length})`}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 min-w-[180px] rounded-xl border border-border bg-popover p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.10)] outline-none animate-in fade-in-0 zoom-in-95"
        >
          {ORDER_STATUSES.map((status) => (
            <label
              key={status}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors hover:bg-muted/60"
            >
              <Checkbox.Root
                checked={value.includes(status)}
                onCheckedChange={() => toggle(status)}
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border bg-background transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              >
                <Checkbox.Indicator>
                  <Check className="h-3 w-3 text-primary-foreground" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              {STATUS_LABELS[status]}
            </label>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
