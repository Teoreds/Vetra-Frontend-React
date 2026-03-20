import { type ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  prevValue?: number;
  icon?: ReactNode;
  accent?: string;
  format?: "number" | "currency" | "days";
}

function fmtEur(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

function fmtDays(n: number) {
  return `${n.toFixed(1)} gg`;
}

export function KpiCard({ title, value, prevValue, icon, accent, format = "number" }: KpiCardProps) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  let display: string;
  if (format === "currency") display = fmtEur(numValue);
  else if (format === "days") display = fmtDays(numValue);
  else display = new Intl.NumberFormat("it-IT").format(numValue);

  let changePercent: number | null = null;
  if (prevValue != null && prevValue > 0) {
    changePercent = ((numValue - prevValue) / prevValue) * 100;
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
          <p className="text-[26px] font-semibold tracking-tight tabular-nums leading-none">{display}</p>
        </div>
        {icon && (
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            accent ?? "bg-primary/8 text-primary",
          )}>
            {icon}
          </div>
        )}
      </div>
      {changePercent != null && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              changePercent > 0 && "bg-emerald-500/8 text-emerald-600",
              changePercent < 0 && "bg-red-500/8 text-red-500",
              changePercent === 0 && "bg-muted text-muted-foreground",
            )}
          >
            {changePercent > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : changePercent < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {changePercent > 0 ? "+" : ""}
            {changePercent.toFixed(1)}%
          </span>
          <span className="text-[11px] text-muted-foreground/60">vs periodo prec.</span>
        </div>
      )}
    </div>
  );
}
