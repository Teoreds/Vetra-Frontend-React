import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  Euro,
  Clock,
  PackageCheck,
  Loader2,
  ArrowRight,
  BarChart3,
  Users,
  Package,
} from "lucide-react";
import { apiClient } from "@/shared/api/client";
import { KpiCard } from "../components/kpi-card";
import { StatusPipeline } from "../components/status-pipeline";
import { MonthlyTrendChart } from "../components/monthly-trend-chart";
import { LatestOrdersTable } from "../components/latest-orders-table";
import { OverdueOrdersTable } from "../components/overdue-orders-table";
import { TopPartiesList, TopArticlesList } from "../components/top-lists";

function useDashboard() {
  const dateFrom = new Date();
  dateFrom.setFullYear(dateFrom.getFullYear() - 1);
  dateFrom.setDate(1);
  const dateFromStr = dateFrom.toISOString().slice(0, 10);

  return useQuery({
    queryKey: ["dashboard", dateFromStr],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/stats/dashboard", {
        params: { query: { date_from: dateFromStr } },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

function SectionCard({
  title,
  icon,
  action,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] ${className ?? ""}`}>
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground/40">{icon}</span>}
          <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        </div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="flex items-center gap-1 text-[12px] font-medium text-primary/70 transition-colors hover:text-primary"
          >
            {action.label}
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
          <p className="text-[13px] text-muted-foreground">Caricamento cruscotto...</p>
        </div>
      </div>
    );
  }

  const { kpis } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Cruscotto</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Panoramica ordini e performance — aggiornato in tempo reale.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          title="Ordini"
          value={kpis.orders_count}
          prevValue={kpis.orders_count_prev}
          format="number"
          icon={<ShoppingCart className="h-[18px] w-[18px]" />}
          accent="bg-blue-500/10 text-blue-600"
        />
        <KpiCard
          title="Fatturato Lordo"
          value={kpis.total_gross}
          prevValue={Number(kpis.total_gross_prev)}
          format="currency"
          icon={<Euro className="h-[18px] w-[18px]" />}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <KpiCard
          title="Backlog"
          value={kpis.backlog_count}
          format="number"
          icon={<PackageCheck className="h-[18px] w-[18px]" />}
          accent="bg-amber-500/10 text-amber-600"
        />
        <KpiCard
          title="Tempo Medio Evasione"
          value={kpis.avg_fulfillment_days ?? 0}
          format="days"
          icon={<Clock className="h-[18px] w-[18px]" />}
          accent="bg-violet-500/10 text-violet-600"
        />
      </div>

      {/* Pipeline + Trend */}
      <div className="grid grid-cols-5 gap-5">
        <SectionCard
          title="Pipeline Ordini"
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          className="col-span-2"
        >
          <StatusPipeline data={data.orders_by_status} />
        </SectionCard>
        <SectionCard
          title="Trend Mensile"
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          className="col-span-3"
        >
          <MonthlyTrendChart data={data.monthly_trend} />
        </SectionCard>
      </div>

      {/* Recent orders + Overdue */}
      <div className="grid grid-cols-5 gap-5">
        <SectionCard
          title="Ultimi Ordini"
          action={{ label: "Tutti gli ordini", onClick: () => navigate("/orders") }}
          className="col-span-3"
        >
          <LatestOrdersTable orders={data.recent_orders} />
        </SectionCard>
        <SectionCard
          title="In Ritardo"
          className="col-span-2"
        >
          <OverdueOrdersTable orders={data.overdue_orders} />
        </SectionCard>
      </div>

      {/* Top clients + Top articles */}
      <div className="grid grid-cols-2 gap-5">
        <SectionCard
          title="Top Clienti"
          icon={<Users className="h-3.5 w-3.5" />}
          action={{ label: "Anagrafica", onClick: () => navigate("/parties") }}
        >
          <TopPartiesList data={data.top_parties} />
        </SectionCard>
        <SectionCard
          title="Top Articoli"
          icon={<Package className="h-3.5 w-3.5" />}
          action={{ label: "Catalogo", onClick: () => navigate("/articles") }}
        >
          <TopArticlesList data={data.top_articles} />
        </SectionCard>
      </div>
    </div>
  );
}
