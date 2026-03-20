import { useOrderStatuses } from "@/shared/hooks/use-lookups";
import { cn } from "@/shared/lib/utils";
import type { components } from "@/shared/api/schema";

type StatusBreakdown = components["schemas"]["StatusBreakdown"];

interface StatusPipelineProps {
  data: StatusBreakdown[];
}

function fmtEur(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

const STATUS_COLORS: Record<string, { bar: string; dot: string }> = {
  DRAFT:     { bar: "bg-slate-400",    dot: "bg-slate-400" },
  CONFIRMED: { bar: "bg-blue-500",     dot: "bg-blue-500" },
  PARTIAL:   { bar: "bg-indigo-500",   dot: "bg-indigo-500" },
  FULFILLED: { bar: "bg-emerald-500",  dot: "bg-emerald-500" },
  PICKING:   { bar: "bg-amber-500",    dot: "bg-amber-500" },
  SHIPPED:   { bar: "bg-teal-500",     dot: "bg-teal-500" },
  COMPLETED: { bar: "bg-green-500",    dot: "bg-green-500" },
  CANCELLED: { bar: "bg-red-400",      dot: "bg-red-400" },
};

export function StatusPipeline({ data }: StatusPipelineProps) {
  const { map: statusLabels } = useOrderStatuses();
  const totalCount = data.reduce((acc, d) => acc + d.count, 0);

  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-[13px] text-muted-foreground">
        Nessun ordine nel periodo.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Segmented bar */}
      <div className="flex h-3 overflow-hidden rounded-full bg-muted/60">
        {data.map((d) => {
          const pct = totalCount > 0 ? (d.count / totalCount) * 100 : 0;
          if (pct === 0) return null;
          const colors = STATUS_COLORS[d.status_code];
          return (
            <div
              key={d.status_code}
              className={cn("transition-all first:rounded-l-full last:rounded-r-full", colors?.bar ?? "bg-slate-300")}
              style={{ width: `${pct}%` }}
              title={`${statusLabels.get(d.status_code) ?? d.status_code}: ${d.count}`}
            />
          );
        })}
      </div>

      {/* Legend grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map((d) => {
          const colors = STATUS_COLORS[d.status_code];
          const pct = totalCount > 0 ? ((d.count / totalCount) * 100).toFixed(0) : "0";
          return (
            <div key={d.status_code} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn("h-2.5 w-2.5 shrink-0 rounded-full", colors?.dot ?? "bg-slate-300")} />
                <span className="truncate text-[12px] text-muted-foreground">
                  {statusLabels.get(d.status_code) ?? d.status_code}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[12px] font-semibold tabular-nums">{d.count}</span>
                <span className="text-[10px] text-muted-foreground/50 tabular-nums">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total footer */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
        <span className="text-[12px] font-medium text-muted-foreground">Totale</span>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold tabular-nums">{totalCount} ordini</span>
          <span className="text-[12px] font-semibold tabular-nums text-muted-foreground">
            {fmtEur(data.reduce((acc, d) => acc + Number(d.total), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
