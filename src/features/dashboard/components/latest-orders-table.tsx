import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { StatusBadge, getStatusVariant } from "@/shared/ui/status-badge";
import { formatDate } from "@/shared/lib/utils";
import { getStatusLabel } from "@/features/orders/types/order-status";
import { useParties } from "@/features/parties/hooks/use-parties";
import type { OrderOut } from "@/features/orders/types/order.types";

interface LatestOrdersTableProps {
  orders: OrderOut[];
  isLoading?: boolean;
}

export function LatestOrdersTable({ orders, isLoading }: LatestOrdersTableProps) {
  const navigate = useNavigate();
  const { data: partiesData } = useParties({ limit: 200 });

  const partyMap = useMemo(() => {
    const map = new Map<string, string>();
    if (partiesData?.items) {
      for (const p of partiesData.items) {
        map.set(p.guid, p.description ?? p.guid.slice(0, 8));
      }
    }
    return map;
  }, [partiesData]);

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
      render: (row) => {
        const name = partyMap.get(row.party_guid);
        if (name) {
          return (
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/8 text-[11px] font-semibold text-primary">
                {name.charAt(0).toUpperCase()}
              </span>
              <span className="text-[13px] font-medium">{name}</span>
            </div>
          );
        }
        return (
          <span className="text-[13px] text-muted-foreground font-mono">
            #{row.party_guid.slice(0, 8).toUpperCase()}
          </span>
        );
      },
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
