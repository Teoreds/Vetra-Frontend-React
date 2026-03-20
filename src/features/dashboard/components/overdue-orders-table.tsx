import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { useOrderStatuses } from "@/shared/hooks/use-lookups";
import { formatDate } from "@/shared/lib/utils";
import type { components } from "@/shared/api/schema";

type OverdueOrder = components["schemas"]["OverdueOrder"];

function fmtEur(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

export function OverdueOrdersTable({ orders }: { orders: OverdueOrder[] }) {
  const navigate = useNavigate();
  const { map: statusLabels } = useOrderStatuses();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/8">
          <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[13px] text-muted-foreground">Nessun ordine in ritardo</p>
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
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-red-500/4"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/8">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-[13px] font-medium">{o.party_description}</p>
              <StatusBadge
                variant={getStatusVariant(o.status_code)}
                label={statusLabels.get(o.status_code) ?? o.status_code}
                className="text-[9px] px-1.5 py-0.5"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {formatDate(o.order_date)} — {fmtEur(Number(o.total_gross ?? 0))}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold text-red-600 tabular-nums">
            +{o.days_overdue}gg
          </span>
        </button>
      ))}
    </div>
  );
}
