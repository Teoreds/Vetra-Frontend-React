import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  ArrowRight,
  BarChart3,
  Users,
  Package,
  AlertTriangle,
} from "lucide-react";
import { apiClient } from "@/shared/api/client";
import { Card } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { KpiCard } from "../components/kpi-card";
import { StatusPipeline } from "../components/status-pipeline";
import { TrendChart } from "../components/trend-chart";
import { LatestOrdersTable } from "../components/latest-orders-table";
import { OverdueOrdersTable } from "../components/overdue-orders-table";
import { TopPartiesList, TopArticlesList } from "../components/top-lists";
import { cn } from "@/shared/lib/utils";

// ─── Period helpers ────────────────────────────────────────────────────────────

type Period = "today" | "week" | "month" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Oggi",
  week: "Settimana",
  month: "Mese",
  year: "Anno",
};

function getDateRange(period: Period): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  if (period === "today") {
    const s = fmt(today);
    return { dateFrom: s, dateTo: s };
  }
  if (period === "week") {
    const from = new Date(today);
    from.setDate(today.getDate() - 6);
    return { dateFrom: fmt(from), dateTo: fmt(today) };
  }
  if (period === "month") {
    const from = new Date(today);
    from.setDate(today.getDate() - 29);
    return { dateFrom: fmt(from), dateTo: fmt(today) };
  }
  // year: 1 Jan of current year → today
  const from = new Date(today.getFullYear(), 0, 1);
  return { dateFrom: fmt(from), dateTo: fmt(today) };
}

// ─── Data hook ────────────────────────────────────────────────────────────────

function useDashboard(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["dashboard", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/stats/dashboard", {
        params: { query: { date_from: dateFrom, date_to: dateTo } },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  action,
  children,
  className,
  variant = "default",
}: {
  title: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "warning";
}) {
  const isWarning = variant === "warning";
  return (
    <Card className={cn(className, isWarning && "overflow-hidden")}>
      {isWarning && (
        <div className="h-[3px] w-full bg-gradient-to-r from-amber-400 to-orange-400" />
      )}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          {icon && (
            <span className={isWarning ? "text-amber-500/70" : "text-muted-foreground/40"}>
              {icon}
            </span>
          )}
          <h2 className={`text-[11px] font-semibold uppercase tracking-wider ${isWarning ? "text-amber-600/80" : "text-muted-foreground"}`}>
            {title}
          </h2>
        </div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="flex items-center gap-1 text-[11px] font-medium text-primary/60 transition-colors hover:text-primary"
          >
            {action.label}
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("month");
  const { dateFrom, dateTo } = getDateRange(period);
  const { data, isLoading } = useDashboard(dateFrom, dateTo);

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
      {/* Header + period selector */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Cruscotto"
          description="Panoramica ordini e performance — aggiornato in tempo reale."
        />
        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Ordini"
          value={kpis.orders_count}
          prevValue={kpis.orders_count_prev}
          format="number"
          dotClass="bg-blue-500"
        />
        <KpiCard
          title="Fatturato Lordo"
          value={kpis.total_gross}
          prevValue={Number(kpis.total_gross_prev)}
          format="currency"
          dotClass="bg-emerald-500"
        />
        <KpiCard
          title="Backlog"
          value={kpis.backlog_count}
          format="number"
          dotClass="bg-amber-500"
        />
        <KpiCard
          title="Tempo Medio Evasione"
          value={kpis.avg_fulfillment_days ?? 0}
          format="days"
          dotClass="bg-violet-500"
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
          title="Trend"
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          className="col-span-3"
        >
          <TrendChart data={data.trend} granularity={data.granularity} />
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
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          className="col-span-2"
          variant={data.overdue_orders.length > 0 ? "warning" : "default"}
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
