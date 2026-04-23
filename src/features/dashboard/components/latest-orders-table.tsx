import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { useOrderStatuses } from "@/shared/hooks/use-lookups";
import { formatDate, formatCurrency } from "@/shared/lib/utils";
import type { components } from "@/shared/api/schema";

type RecentOrder = components["schemas"]["RecentOrder"];

export function LatestOrdersTable({ orders }: { orders: RecentOrder[] }) {
  const navigate = useNavigate();
  const { map: statusLabels } = useOrderStatuses();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-8 text-center">
        <p className="text-[13px] text-muted-foreground">Nessun ordine recente.</p>
      </div>
    );
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr>
          <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 pr-4">Data</th>
          <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 pr-4">Cliente</th>
          <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 pr-4">Stato</th>
          <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Totale</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {orders.map((o) => (
          <tr
            key={o.guid}
            onClick={() => navigate(`/orders/${o.guid}`)}
            className="cursor-pointer transition-colors hover:bg-muted/40"
          >
            <td className="py-2.5 pr-4 text-[12px] text-muted-foreground whitespace-nowrap">
              {formatDate(o.order_date)}
            </td>
            <td className="py-2.5 pr-4 text-[13px] font-medium max-w-[180px] truncate">
              {o.party_description}
            </td>
            <td className="py-2.5 pr-4">
              <StatusBadge
                variant={getStatusVariant(o.status_code)}
                label={statusLabels.get(o.status_code) ?? o.status_code}
                className="text-[10px] px-2 py-0.5 rounded"
              />
            </td>
            <td className="py-2.5 text-[13px] font-medium tabular-nums text-right whitespace-nowrap">
              {o.total_gross != null ? formatCurrency(Number(o.total_gross)) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
