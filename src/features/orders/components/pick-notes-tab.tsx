import { DataTable, type Column } from "@/shared/ui/data-table";
import { formatDate } from "@/shared/lib/utils";
import type { PickNoteOut } from "../types/order.types";

interface PickNotesTabProps {
  orderGuid: string;
}

export function PickNotesTab({ orderGuid: _orderGuid }: PickNotesTabProps) {
  // Placeholder: in produzione, le note di prelievo vengono recuperate dal backend
  const pickNotes: PickNoteOut[] = [];

  const columns: Column<PickNoteOut>[] = [
    {
      key: "guid",
      header: "ID Nota",
      render: (row) => (
        <span className="font-medium text-primary">
          #{row.guid.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "warehouse_guid",
      header: "Magazzino",
      render: (row) => (
        <span className="font-mono text-sm">
          {row.warehouse_guid.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Creato il",
      render: (row) => (
        <span className="text-sm">{formatDate(row.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-semibold">Note di Prelievo</h3>
      <DataTable
        columns={columns}
        data={pickNotes}
        keyExtractor={(row) => row.guid}
        emptyMessage="Nessuna nota di prelievo creata."
      />
    </div>
  );
}
