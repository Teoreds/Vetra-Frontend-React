import { DataTable, type Column } from "@/shared/ui/data-table";
import { formatCurrency } from "@/shared/lib/utils";
import { useOrder } from "../hooks/use-order";
import type { OrderRowOut } from "../types/order.types";

interface OrderRowsTableProps {
  orderGuid: string;
}

export function OrderRowsTable({ orderGuid }: OrderRowsTableProps) {
  // Order rows come embedded in the order detail in a real impl.
  // For the skeleton, we demonstrate the pattern using a placeholder.
  const { isLoading } = useOrder(orderGuid);

  const rows: OrderRowOut[] = []; // Placeholder: rows would come from order detail or a dedicated endpoint

  const columns: Column<OrderRowOut>[] = [
    {
      key: "article_guid",
      header: "Article",
      render: (row) => (
        <span className="font-mono text-sm">{row.article_guid.slice(0, 8)}...</span>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (row) => <span>{row.quantity}</span>,
    },
    {
      key: "unit_price",
      header: "Unit Price",
      render: (row) => <span>{formatCurrency(row.unit_price)}</span>,
    },
    {
      key: "total",
      header: "Total",
      render: (row) => (
        <span className="font-medium">
          {formatCurrency(parseFloat(row.quantity) * parseFloat(row.unit_price))}
        </span>
      ),
    },
    {
      key: "availability",
      header: "Availability",
      render: (row) => (
        <span className="text-sm capitalize">
          {row.availability_status_code.toLowerCase().replace("_", " ")}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      keyExtractor={(row) => row.guid}
      isLoading={isLoading}
      emptyMessage="No rows added yet."
    />
  );
}
