import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/shared/lib/utils";

interface TabBarProps {
  children: React.ReactNode;
  className?: string;
}

/** Consistent tab list container with bottom border */
export function TabBar({ children, className }: TabBarProps) {
  return (
    <Tabs.List className={cn("flex gap-0 border-b border-border/60", className)}>
      {children}
    </Tabs.List>
  );
}

interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

/** Consistent tab trigger with active underline indicator */
export function TabTrigger({ value, children, className }: TabTriggerProps) {
  return (
    <Tabs.Trigger
      value={value}
      className={cn(
        "relative px-4 py-2.5 text-[length:var(--text-body)] font-medium text-muted-foreground transition-colors",
        "hover:text-foreground data-[state=active]:text-foreground",
        "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-primary",
        "after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100",
        className,
      )}
    >
      {children}
    </Tabs.Trigger>
  );
}
