import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import type { components } from "@/shared/api/schema";

type MonthlyTrend = components["schemas"]["MonthlyTrend"];

interface MonthlyTrendChartProps {
  data: MonthlyTrend[];
}

function fmtEurShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return n.toFixed(0);
}

function fmtEur(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function fmtMonth(m: string) {
  const [, mm] = m.split("-");
  const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  return months[parseInt(mm, 10) - 1] ?? mm;
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-muted-foreground">
        Nessun dato disponibile.
      </p>
    );
  }

  const maxGross = Math.max(...data.map((d) => Number(d.total_gross)), 1);

  return (
    <div className="space-y-3">
      {/* Y-axis hint + Bars */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 flex h-full flex-col justify-between pointer-events-none">
          <div className="border-b border-dashed border-border/40" />
          <div className="border-b border-dashed border-border/40" />
          <div />
        </div>
        <div className="relative flex items-end gap-1" style={{ height: 160 }}>
          {data.map((d, i) => {
            const gross = Number(d.total_gross);
            const grossH = (gross / maxGross) * 100;
            const isActive = hovered === i;
            return (
              <div
                key={d.month}
                className="group/bar relative flex flex-1 flex-col items-center justify-end cursor-default"
                style={{ height: "100%" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                {isActive && (
                  <div className="absolute -top-1 z-10 rounded-lg border border-border/60 bg-card px-2.5 py-1.5 shadow-lg -translate-y-full">
                    <p className="text-[11px] font-semibold tabular-nums whitespace-nowrap">{fmtEur(gross)}</p>
                    <p className="text-[10px] text-muted-foreground tabular-nums">{d.order_count} ordini</p>
                  </div>
                )}
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all duration-200",
                    isActive ? "bg-primary" : "bg-primary/50",
                  )}
                  style={{ height: `${Math.max(grossH, 4)}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1">
        {data.map((d, i) => (
          <div
            key={d.month}
            className={cn(
              "flex-1 text-center text-[10px] font-medium transition-colors",
              hovered === i ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {fmtMonth(d.month)}
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-3 rounded-sm bg-primary/50" />
          <span className="text-[11px] text-muted-foreground">Fatturato mensile</span>
        </div>
        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
          Max: {fmtEurShort(maxGross)}
        </span>
      </div>
    </div>
  );
}
