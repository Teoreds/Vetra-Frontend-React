import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const baseClass =
  "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] shadow-sm transition-all duration-150";

const uncheckedClass = "border-border/70 bg-background";

const checkedClass =
  "border-primary bg-primary text-primary-foreground";

/**
 * Interactive checkbox — wraps Radix, fires onCheckedChange on click.
 * Use in forms with react-hook-form Controller, standalone toggles, etc.
 */
export function Checkbox({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root>) {
  return (
    <RadixCheckbox.Root
      className={cn(
        baseClass,
        uncheckedClass,
        "hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <RadixCheckbox.Indicator className="flex items-center justify-center text-current animate-in zoom-in-75 fade-in-0 duration-150">
        <Check className="h-3 w-3" strokeWidth={3} />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}

/**
 * Display-only checkbox — no Radix, no internal state, no event handlers.
 * Renders a styled div that mirrors the Checkbox look.
 * Use when a parent element (row, div) already handles the click.
 */
export function CheckboxDisplay({
  checked,
  disabled,
  className,
}: {
  checked: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        baseClass,
        checked ? checkedClass : uncheckedClass,
        disabled && "opacity-40",
        className,
      )}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </div>
  );
}
