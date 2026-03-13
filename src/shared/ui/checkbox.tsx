import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function Checkbox({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root>) {
  return (
    <RadixCheckbox.Root
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border/80 bg-background transition-colors",
        "hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadixCheckbox.Indicator>
        <Check className="h-3 w-3" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
