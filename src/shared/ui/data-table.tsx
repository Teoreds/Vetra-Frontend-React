import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { EmptyState } from "./empty-state";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
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
        <tr key={i} className="border-b border-border/50">
          {Array.from({ length: columns }).map((__, j) => (
            <td key={j} className="p-4">
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
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "h-11 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground",
                  col.className,
                )}
              >
                {col.header}
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
                  "border-b border-border/50 transition-colors duration-100",
                  "hover:bg-slate-50/80",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3.5 align-middle", col.className)}
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
