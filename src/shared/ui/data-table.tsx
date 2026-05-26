import type { ReactNode } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { EmptyState } from "./empty-state";

export type SortDirection = "asc" | "desc" | null;

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

function SkeletonRows({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-border">
          {Array.from({ length: columns }).map((__, j) => (
            <td key={j} className="px-4 [padding-block:var(--row-pad-y)]">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  keyExtractor,
  isLoading,
  emptyMessage = "No data found",
  emptyDescription,
}: DataTableProps<T>) {
  if (!isLoading && data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description={emptyDescription}
        className="py-12"
      />
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-b-xl">
      <table className="w-full caption-bottom [font-size:var(--table-font-size)]">
        <thead className="bg-muted">
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "h-10 px-4 text-left align-middle text-[length:var(--text-caption)] font-semibold uppercase tracking-wider text-subtle-foreground",
                  col.className,
                  col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors",
                )}
                onClick={col.sortable ? col.onSort : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    col.sortDirection === "asc" ? (
                      <ArrowUp className="h-3 w-3 text-primary" />
                    ) : col.sortDirection === "desc" ? (
                      <ArrowDown className="h-3 w-3 text-primary" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-30" />
                    )
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows columns={columns.length} />
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "group/row border-b border-border last:border-0 transition-colors duration-75",
                  "hover:bg-muted",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 [padding-block:var(--row-pad-y)] align-middle", col.className)}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
