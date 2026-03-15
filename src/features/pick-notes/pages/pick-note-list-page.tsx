import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { usePickNotes, type PickNoteListParams } from "../hooks/use-pick-notes";
import { PickNotesTable } from "../components/pick-notes-table";
import { PickNoteFiltersBar } from "../components/pick-note-filters-bar";

const DEFAULT_LIMIT = 20;

export function PickNoteListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PickNoteListParams>({
    offset: 0,
    limit: DEFAULT_LIMIT,
  });

  const { data, isLoading } = usePickNotes(filters);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold">Note di Prelievo</h1>
          {data && (
            <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {data.total}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Gestisci le note di prelievo e monitorane lo stato.
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <PickNoteFiltersBar
            filters={filters}
            onFilterChange={(updated) =>
              setFilters((f) => ({ ...f, ...updated, offset: 0 }))
            }
            onReset={() => setFilters({ offset: 0, limit: DEFAULT_LIMIT })}
          />
          <Button onClick={() => navigate("/pick-notes/new")} size="sm">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Nuova Nota di Prelievo
          </Button>
        </div>

        <PickNotesTable pickNotes={data?.items ?? []} isLoading={isLoading} />
        {data && data.total > 0 && (
          <PaginationControls
            total={data.total}
            offset={data.offset}
            limit={data.limit}
            onPageChange={(offset) => setFilters((f) => ({ ...f, offset }))}
          />
        )}
      </div>
    </div>
  );
}
