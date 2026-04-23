import { cn, formatCurrency, formatNumber } from "@/shared/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  prevValue?: number;
  dotClass?: string;
  format?: "number" | "currency" | "days";
}

function fmtDays(n: number) {
  return `${n.toFixed(1)} gg`;
}

export function KpiCard({ title, value, prevValue, dotClass, format = "number" }: KpiCardProps) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  let display: string;
  if (format === "currency") display = formatCurrency(numValue);
  else if (format === "days") display = fmtDays(numValue);
  else display = formatNumber(numValue);

  let changePercent: number | null = null;
  if (prevValue != null && prevValue > 0) {
    changePercent = ((numValue - prevValue) / prevValue) * 100;
  }

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-5">
      <div className="flex items-center gap-1.5 mb-3">
        {dotClass && <span className={cn("h-2 w-2 rounded-full shrink-0", dotClass)} />}
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      </div>
      <p className="text-[30px] font-semibold tracking-tight tabular-nums leading-none">{display}</p>
      {changePercent != null && (
        <div className="mt-3 text-[12px]">
          {changePercent > 0 ? (
            <>
              <span className="text-emerald-600">↑ {Math.abs(changePercent).toFixed(1)}%</span>
              <span className="ml-1.5 text-muted-foreground/60">vs periodo prec.</span>
            </>
          ) : changePercent < 0 ? (
            <>
              <span className="text-red-500">↓ {Math.abs(changePercent).toFixed(1)}%</span>
              <span className="ml-1.5 text-muted-foreground/60">vs periodo prec.</span>
            </>
          ) : (
            <span className="text-muted-foreground/60">— invariato</span>
          )}
        </div>
      )}
    </div>
  );
}
