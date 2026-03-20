import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { useOrderStatuses } from "@/shared/hooks/use-lookups";
import { formatDate } from "@/shared/lib/utils";
import type { components } from "@/shared/api/schema";

type RecentOrder = components["schemas"]["RecentOrder"];

function fmtEur(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

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
    <div className="space-y-0.5">
      {orders.map((o) => (
        <button
          key={o.guid}
          type="button"
          onClick={() => navigate(`/orders/${o.guid}`)}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/6 text-[12px] font-semibold text-primary ring-1 ring-primary/10">
            {o.party_description.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-[13px] font-medium group-hover:text-primary transition-colors">
                {o.party_description}
              </p>
              <StatusBadge
                variant={getStatusVariant(o.status_code)}
                label={statusLabels.get(o.status_code) ?? o.status_code}
                className="text-[9px] px-1.5 py-0.5"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {formatDate(o.order_date)}
              {o.total_gross != null && (
                <span className="ml-1.5 font-medium text-foreground/60">{fmtEur(Number(o.total_gross))}</span>
              )}
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-mono text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
            #{o.guid.slice(0, 8).toUpperCase()}
          </span>
        </button>
      ))}
    </div>
  );
}
