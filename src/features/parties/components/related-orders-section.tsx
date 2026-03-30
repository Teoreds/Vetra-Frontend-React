import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { useOrderStatuses } from "@/shared/hooks/use-lookups";
import { formatDate, formatCurrency } from "@/shared/lib/utils";
import { useOrders } from "@/features/orders/hooks/use-orders";

interface RelatedOrdersSectionProps {
  partyGuid: string;
}

export function RelatedOrdersSection({ partyGuid }: RelatedOrdersSectionProps) {
  const navigate = useNavigate();
  const { data, isLoading } = useOrders({ party_guid: partyGuid, limit: 5 });
  const { map: statusLabels } = useOrderStatuses();

  const orders = data?.items ?? [];

  return (
    <Card>
      <div className="px-5 pt-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Ordini Collegati
        </h3>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-[13px] text-muted-foreground">Caricamento…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-[13px] text-muted-foreground">Nessun ordine collegato.</p>
        </div>
      ) : (
        <div className="space-y-0.5 p-2">
          {orders.map((o) => (
            <button
              key={o.guid}
              type="button"
              onClick={() => navigate(`/orders/${o.guid}`)}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium group-hover:text-primary transition-colors">
                    {formatDate(o.order_date)}
                  </p>
                  <StatusBadge
                    variant={getStatusVariant(o.status_code)}
                    label={statusLabels.get(o.status_code) ?? o.status_code}
                    className="text-[9px] px-1.5 py-0.5"
                  />
                </div>
                {o.total_gross != null && (
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {formatCurrency(Number(o.total_gross))}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[10px] font-mono text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
                #{o.guid.slice(0, 8).toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
