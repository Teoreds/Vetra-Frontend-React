import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { it } from "react-day-picker/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import "react-day-picker/style.css";

interface DatePickerProps {
  value?: string; // ISO date YYYY-MM-DD
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function parseISO(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso + "T12:00:00");
  return isNaN(d.getTime()) ? undefined : d;
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleziona una data",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseISO(value ?? "");

  const displayValue = selected
    ? selected.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-lg border border-border/60 bg-background px-3 text-[13px] outline-none transition-all",
            "hover:border-border focus-visible:outline-none focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20 data-[state=open]:border-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-ring/20",
            !displayValue && "text-muted-foreground/70",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          <span>{displayValue ?? placeholder}</span>
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 rounded-xl border border-border bg-popover p-3 shadow-[0_8px_30px_rgba(0,0,0,0.10)] outline-none animate-in fade-in-0 zoom-in-95"
        >
          <DayPicker
            mode="single"
            locale={it}
            selected={selected}
            defaultMonth={selected ?? new Date()}
            onSelect={(date) => {
              if (date) {
                onChange?.(toISO(date));
                setOpen(false);
              }
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
