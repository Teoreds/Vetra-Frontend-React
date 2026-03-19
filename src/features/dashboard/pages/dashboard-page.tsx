import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useOrders } from "@/features/orders/hooks/use-orders";
import { KpiCard } from "../components/kpi-card";
import { LatestOrdersTable } from "../components/latest-orders-table";
import { RecentActivity } from "../components/recent-activity";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: ordersData, isLoading } = useOrders({ limit: 5, offset: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Cruscotto Royalstone</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Qui è possibile consultare una panoramica degli ordini e delle spedizioni.
          </p>
        </div>
        <Button onClick={() => navigate("/orders/new")}>
          <Plus className="mr-1 h-4 w-4" />
          Crea Ordine
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Ordini Totali" value={ordersData?.total ?? "..."} changePercent={12.5} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <div className="rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-5 pt-5">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Ultimi Ordini</h2>
              <Button
                variant="link"
                className="text-[13px] text-primary"
                onClick={() => navigate("/orders")}
              >
                Vedi Tutti
              </Button>
            </div>
            <LatestOrdersTable orders={ordersData?.items ?? []} isLoading={isLoading} />
          </div>
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}
