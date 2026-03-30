import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { ShoppingCart } from "lucide-react";
import { formatDate, formatCurrency } from "@/shared/lib/utils";
import { useOrderStatuses } from "@/shared/hooks/use-lookups";
import { useOrders } from "@/features/orders/hooks/use-orders";

interface OrdersTabProps {
  partyGuid: string;
}

export function OrdersTab({ partyGuid }: OrdersTabProps) {
  const navigate = useNavigate();
  const { data, isLoading } = useOrders({ party_guid: partyGuid, limit: 100 });
  const { map: statusLabels } = useOrderStatuses();

  const orders = data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[15px] font-semibold">Ordini</h2>
          {orders.length > 0 && (
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {orders.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">Caricamento…</p>
        ) : orders.length === 0 ? (
          <p className="rounded-lg border border-border/60 bg-muted/40 py-6 text-center text-[13px] text-muted-foreground">
            Nessun ordine trovato.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border/60">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Ordine</th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Data</th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Stato</th>
                  <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Totale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {orders.map((o) => (
                  <tr
                    key={o.guid}
                    onClick={() => navigate(`/orders/${o.guid}`)}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-semibold text-primary">#{o.code}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{formatDate(o.order_date)}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge
                        variant={getStatusVariant(o.status_code)}
                        label={statusLabels.get(o.status_code) ?? o.status_code}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-medium">
                      {o.total_gross != null ? formatCurrency(Number(o.total_gross)) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
