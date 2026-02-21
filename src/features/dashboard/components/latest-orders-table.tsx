import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { StatusBadge, getStatusVariant } from "@/shared/ui/status-badge";
import { formatDate } from "@/shared/lib/utils";
import { getStatusLabel } from "@/features/orders/types/order-status";
import type { OrderOut } from "@/features/orders/types/order.types";

interface LatestOrdersTableProps {
  orders: OrderOut[];
  isLoading?: boolean;
}

export function LatestOrdersTable({ orders, isLoading }: LatestOrdersTableProps) {
  const navigate = useNavigate();

  const columns: Column<OrderOut>[] = [
    {
      key: "guid",
      header: "ID Ordine",
      render: (row) => (
        <span className="font-medium text-primary">
          #{row.guid.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "party",
      header: "Cliente",
      render: (row) => <span className="text-sm">{row.party_guid.slice(0, 8)}...</span>,
    },
    {
      key: "order_date",
      header: "Data",
      render: (row) => <span className="text-sm">{formatDate(row.order_date)}</span>,
    },
    {
      key: "status_code",
      header: "Stato",
      render: (row) => (
        <StatusBadge
          variant={getStatusVariant(row.status_code)}
          label={getStatusLabel(row.status_code)}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      keyExtractor={(row) => row.guid}
      onRowClick={(row) => navigate(`/orders/${row.guid}`)}
      isLoading={isLoading}
      emptyMessage="Nessun ordine recente."
    />
  );
}
