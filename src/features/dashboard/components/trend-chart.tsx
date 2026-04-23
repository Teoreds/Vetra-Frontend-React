import { useState } from "react";
import { cn, formatCurrency, formatCurrencyCompact } from "@/shared/lib/utils";
import type { components } from "@/shared/api/schema";

type TrendPoint = components["schemas"]["TrendPoint"];

interface TrendChartProps {
  data: TrendPoint[];
  granularity: string;
}

const MONTHS = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

function fmtPeriod(period: string, granularity: string): string {
  if (granularity === "month") {
    const [, mm] = period.split("-");
    return MONTHS[parseInt(mm, 10) - 1] ?? mm;
  }
  // day: "YYYY-MM-DD" → "GG/MM"
  const [, mm, dd] = period.split("-");
  return `${dd}/${mm}`;
}

export function TrendChart({ data, granularity }: TrendChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-muted-foreground">
        Nessun dato nel periodo selezionato.
      </p>
    );
  }

  const maxGross = Math.max(...data.map((d) => Number(d.total_gross)), 1);

  // When there are many bars, show labels only every N steps
  const labelStep = data.length > 20 ? Math.ceil(data.length / 10) : 1;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 flex h-full flex-col justify-between pointer-events-none">
          <div className="border-b border-dashed border-border/40" />
          <div className="border-b border-dashed border-border/40" />
          <div />
        </div>
        <div className="relative flex items-end justify-center gap-1" style={{ height: 160 }}>
          {data.map((d, i) => {
            const gross = Number(d.total_gross);
            const grossH = (gross / maxGross) * 100;
            const isActive = hovered === i;
            return (
              <div
                key={d.period}
                className="group/bar relative flex flex-col items-center justify-end cursor-default"
                style={{ height: "100%", flex: 1, minWidth: 4, maxWidth: 40 }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {isActive && (
                  <div className="absolute -top-1 z-10 rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-md -translate-y-full whitespace-nowrap">
                    <p className="text-[11px] font-semibold tabular-nums">{formatCurrency(gross)}</p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">{d.order_count} ordini</p>
                  </div>
                )}
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-all duration-150",
                    isActive ? "bg-primary" : "bg-primary/50",
                  )}
                  style={{ height: `${Math.max(grossH, gross > 0 ? 3 : 0)}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-1">
        {data.map((d, i) => (
          <div
            key={d.period}
            className={cn(
              "text-center text-[10px] transition-colors overflow-hidden",
              hovered === i ? "text-foreground font-medium" : "text-muted-foreground",
            )}
            style={{ flex: 1, minWidth: 4, maxWidth: 40 }}
          >
            {i % labelStep === 0 ? fmtPeriod(d.period, granularity) : ""}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-3 rounded-sm bg-primary/50" />
          <span className="text-[11px] text-muted-foreground">
            Fatturato {granularity === "month" ? "mensile" : "giornaliero"}
          </span>
        </div>
        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
          Max: {formatCurrencyCompact(maxGross)}
        </span>
      </div>
    </div>
  );
}
