import { cn } from "@/shared/lib/utils";

/**
 * Unified list page container — toolbar + table in a single surface.
 *
 * Usage:
 *   <ListPanel>
 *     <ListPanel.Toolbar left={<FiltersBar />} right={<Actions />} />
 *     <DataTable ... />
 *     <PaginationControls ... />
 *   </ListPanel>
 */
function ListPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border/60 bg-card overflow-hidden", className)}>
      {children}
    </div>
  );
}

interface ListPanelToolbarProps {
  /** Left side: search, filters, chips */
  left?: React.ReactNode;
  /** Right side: refresh button, primary action button */
  right?: React.ReactNode;
  className?: string;
}

function ListPanelToolbar({ left, right, className }: ListPanelToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-border/50 px-4 py-3",
        className,
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-3 min-w-0">{left}</div>
      {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
    </div>
  );
}

ListPanel.Toolbar = ListPanelToolbar;

export { ListPanel };
