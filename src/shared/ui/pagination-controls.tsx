import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface PaginationControlsProps {
  total: number;
  offset: number;
  limit: number;
  onPageChange: (offset: number) => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export function PaginationControls({
  total,
  offset,
  limit,
  onPageChange,
}: PaginationControlsProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const from = offset + 1;
  const to = Math.min(offset + limit, total);
  const pages = getPageNumbers(currentPage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {from}-{to}
        </span>{" "}
        di <span className="font-medium text-foreground">{total}</span> risultati
      </p>

      <div className="flex items-center gap-1">
        <NavButton
          onClick={() => onPageChange(0)}
          disabled={currentPage === 1}
          label="First"
        >
          <ChevronsLeft className="h-4 w-4" />
        </NavButton>
        <NavButton
          onClick={() => onPageChange(offset - limit)}
          disabled={currentPage === 1}
          label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </NavButton>

        {pages.map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-sm text-muted-foreground">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange((page - 1) * limit)}
              className={cn(
                "flex h-8 min-w-[32px] items-center justify-center rounded-md px-2 text-sm font-medium transition-colors",
                page === currentPage
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {page}
            </button>
          ),
        )}

        <NavButton
          onClick={() => onPageChange(offset + limit)}
          disabled={currentPage === totalPages}
          label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </NavButton>
        <NavButton
          onClick={() => onPageChange((totalPages - 1) * limit)}
          disabled={currentPage === totalPages}
          label="Last"
        >
          <ChevronsRight className="h-4 w-4" />
        </NavButton>
      </div>
    </div>
  );
}

function NavButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
