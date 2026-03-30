import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { it } from "react-day-picker/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import "react-day-picker/style.css";

interface DateRangePickerProps {
  from?: string; // ISO YYYY-MM-DD
  to?: string;
  onChange?: (range: { from?: string; to?: string }) => void;
  placeholder?: string;
  className?: string;
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

function formatDisplay(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function makeOrderedRange(a: Date, b: Date) {
  return a <= b ? { from: a, to: b } : { from: b, to: a };
}

export function DateRangePicker({
  from,
  to,
  onChange,
  placeholder = "Seleziona periodo",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState<Date | undefined>(undefined);
  const [hovered, setHovered] = useState<Date | undefined>(undefined);

  const committedFrom = parseISO(from ?? "");
  const committedTo = parseISO(to ?? "");

  // Build the visual range rdp displays:
  // - Selecting phase (draftFrom set): show preview from anchor to hovered day
  // - Idle phase: show the committed range
  const rdpSelected = draftFrom
    ? hovered
      ? makeOrderedRange(draftFrom, hovered)
      : { from: draftFrom, to: draftFrom }
    : committedFrom && committedTo
      ? { from: committedFrom, to: committedTo }
      : undefined;

  const hasRange = !!from && !!to;
  const displayValue = hasRange
    ? `${formatDisplay(committedFrom!)} — ${formatDisplay(committedTo!)}`
    : null;

  function handleOpenChange(next: boolean) {
    if (next) {
      setDraftFrom(undefined);
      setHovered(undefined);
    }
    setOpen(next);
  }

  function handleDayClick(day: Date) {
    if (!draftFrom) {
      // First click: anchor
      setDraftFrom(day);
      setHovered(undefined);
    } else {
      // Second click: commit and close
      const { from: f, to: t } = makeOrderedRange(draftFrom, day);
      onChange?.({ from: toISO(f), to: toISO(t) });
      setDraftFrom(undefined);
      setHovered(undefined);
      setOpen(false);
    }
  }

  function handleDayMouseEnter(day: Date) {
    if (draftFrom) {
      setHovered(day);
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-background px-3 text-[13px] outline-none transition-all whitespace-nowrap",
            "hover:border-border focus-visible:outline-none focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20 data-[state=open]:border-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-ring/20",
            !displayValue && "text-muted-foreground/70",
            className,
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {displayValue && <span>{displayValue}</span>}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-50 rounded-xl border border-border/60 bg-popover p-3 shadow-lg outline-none animate-in fade-in-0 zoom-in-95"
        >
          <DayPicker
            mode="range"
            locale={it}
            selected={rdpSelected}
            defaultMonth={committedFrom ?? new Date()}
            onSelect={() => {
              // Handled via onDayClick
            }}
            onDayClick={handleDayClick}
            onDayMouseEnter={handleDayMouseEnter}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
