import { DataTable, type Column } from "@/shared/ui/data-table";
import { formatDate } from "@/shared/lib/utils";
import type { DeliveryNoteOut } from "../types/order.types";

interface DeliveryNotesTabProps {
  orderGuid: string;
}

export function DeliveryNotesTab({
  orderGuid: _orderGuid,
}: DeliveryNotesTabProps) {
  // Placeholder: in produzione, le note di consegna vengono recuperate dal backend
  const deliveryNotes: DeliveryNoteOut[] = [];

  const columns: Column<DeliveryNoteOut>[] = [
    {
      key: "guid",
      header: "Nota di Consegna",
      render: (row) => (
        <span className="font-medium text-primary">
          #{row.guid.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "delivery_date",
      header: "Data Consegna",
      render: (row) => (
        <span className="text-sm">{formatDate(row.delivery_date)}</span>
      ),
    },
    {
      key: "customer_party_guid",
      header: "Cliente",
      render: (row) => (
        <span className="font-mono text-sm">
          {row.customer_party_guid.slice(0, 8)}...
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
      <h3 className="text-[15px] font-semibold">Note di Consegna</h3>
      <DataTable
        columns={columns}
        data={deliveryNotes}
        keyExtractor={(row) => row.guid}
        emptyMessage="Nessuna nota di consegna creata."
      />
    </div>
  );
}
