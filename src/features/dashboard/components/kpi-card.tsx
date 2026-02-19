import { cn } from "@/shared/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  changePercent?: number;
  className?: string;
}

export function KpiCard({ title, value, changePercent, className }: KpiCardProps) {
  return (
    <div className={cn("rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]", className)}>
      <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {changePercent !== undefined && (
          <span
            className={cn(
              "text-[11px] font-semibold",
              changePercent >= 0 ? "text-emerald-600" : "text-red-500",
            )}
          >
            {changePercent >= 0 ? "+" : ""}
            {changePercent}%
          </span>
        )}
      </div>
    </div>
  );
}
