import { cn } from "@/shared/lib/utils";

interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Horizontal toolbar for list pages.
 * Renders filter controls on the left and action buttons on the right.
 * Replaces the previous Card > border-b toolbar pattern.
 */
export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ToolbarActionsProps {
  children: React.ReactNode;
  className?: string;
}

/** Right-aligned section of the toolbar for action buttons */
export function ToolbarActions({ children, className }: ToolbarActionsProps) {
  return (
    <div className={cn("flex items-center gap-2 shrink-0", className)}>
      {children}
    </div>
  );
}
