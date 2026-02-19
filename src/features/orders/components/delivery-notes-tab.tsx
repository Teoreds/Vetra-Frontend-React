import { DataTable, type Column } from "@/shared/ui/data-table";
import { formatDate } from "@/shared/lib/utils";
import type { DeliveryNoteOut } from "../types/order.types";

interface DeliveryNotesTabProps {
  orderGuid: string;
}

export function DeliveryNotesTab({ orderGuid: _orderGuid }: DeliveryNotesTabProps) {
  // Placeholder: In production, fetch delivery notes linked to this order
  const deliveryNotes: DeliveryNoteOut[] = [];

  const columns: Column<DeliveryNoteOut>[] = [
    {
      key: "guid",
      header: "Delivery Note",
      render: (row) => (
        <span className="font-medium text-primary">#{row.guid.slice(0, 8).toUpperCase()}</span>
      ),
    },
    {
      key: "delivery_date",
      header: "Delivery Date",
      render: (row) => <span className="text-sm">{formatDate(row.delivery_date)}</span>,
    },
    {
      key: "customer_party_guid",
      header: "Customer",
      render: (row) => (
        <span className="font-mono text-sm">{row.customer_party_guid.slice(0, 8)}...</span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (row) => <span className="text-sm">{formatDate(row.created_at)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-semibold">Delivery Notes</h3>
      <DataTable
        columns={columns}
        data={deliveryNotes}
        keyExtractor={(row) => row.guid}
        emptyMessage="No delivery notes created yet."
      />
    </div>
  );
}
