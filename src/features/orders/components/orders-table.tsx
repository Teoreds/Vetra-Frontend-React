import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { StatusBadge, getStatusVariant } from "@/shared/ui/status-badge";
import { formatDate } from "@/shared/lib/utils";
import { getStatusLabel } from "../types/order-status";
import type { OrderOut } from "../types/order.types";

interface OrdersTableProps {
  orders: OrderOut[];
  isLoading?: boolean;
}

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const navigate = useNavigate();

  const columns: Column<OrderOut>[] = [
    {
      key: "guid",
      header: "Order ID",
      render: (row) => (
        <span className="text-[13px] font-semibold text-primary">
          #{row.guid.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "party_guid",
      header: "Party",
      render: (row) => (
        <span className="text-[13px] text-muted-foreground font-mono">{row.party_guid.slice(0, 8)}...</span>
      ),
    },
    {
      key: "status_code",
      header: "Status",
      render: (row) => (
        <StatusBadge
          variant={getStatusVariant(row.status_code)}
          label={getStatusLabel(row.status_code)}
        />
      ),
    },
    {
      key: "order_date",
      header: "Order Date",
      render: (row) => <span className="text-[13px] text-muted-foreground">{formatDate(row.order_date)}</span>,
    },
    {
      key: "created_at",
      header: "Created",
      render: (row) => <span className="text-[13px] text-muted-foreground">{formatDate(row.created_at)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: () => (
        <button className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted">
          <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
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
      emptyMessage="No orders found."
    />
  );
}
