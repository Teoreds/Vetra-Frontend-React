import { useNavigate } from "react-router-dom";
import { cn, formatCurrency, formatNumber } from "@/shared/lib/utils";
import type { components } from "@/shared/api/schema";

type TopParty = components["schemas"]["TopParty"];
type TopArticle = components["schemas"]["TopArticle"];

const RANK_STYLES = [
  "bg-amber-500/12 text-amber-600 ring-1 ring-amber-500/20",
  "bg-muted-foreground/12 text-muted-foreground ring-1 ring-muted-foreground/20",
  "bg-orange-400/12 text-orange-500 ring-1 ring-orange-400/20",
];

// ── Top Clienti ──
export function TopPartiesList({ data }: { data: TopParty[] }) {
  const navigate = useNavigate();

  if (data.length === 0) {
    return <p className="py-4 text-center text-[13px] text-muted-foreground">Nessun dato.</p>;
  }

  const maxGross = Number(data[0]?.total_gross ?? 1);

  return (
    <div className="space-y-1">
      {data.map((p, idx) => {
        const gross = Number(p.total_gross);
        const pct = maxGross > 0 ? (gross / maxGross) * 100 : 0;
        return (
          <button
            key={p.party_guid}
            type="button"
            onClick={() => navigate(`/parties/${p.party_guid}`)}
            className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60"
          >
            <span className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
              idx < 3 ? RANK_STYLES[idx] : "bg-muted text-muted-foreground",
            )}>
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[13px] font-medium group-hover:text-primary transition-colors">{p.description}</p>
                <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                  {formatCurrency(gross)}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted/80">
                <div
                  className="h-full rounded-full bg-primary/30 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Top Articoli ──
export function TopArticlesList({ data }: { data: TopArticle[] }) {
  const navigate = useNavigate();

  if (data.length === 0) {
    return <p className="py-4 text-center text-[13px] text-muted-foreground">Nessun dato.</p>;
  }

  return (
    <div className="space-y-1">
      {data.map((a, idx) => (
        <button
          key={a.article_guid}
          type="button"
          onClick={() => navigate(`/articles/${a.article_guid}`)}
          className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60"
        >
          <span className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
            idx < 3 ? RANK_STYLES[idx] : "bg-muted text-muted-foreground",
          )}>
            {idx + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium group-hover:text-primary transition-colors">{a.description}</p>
            <p className="text-[11px] text-muted-foreground">
              {a.code} — Qtà: {formatNumber(Number(a.total_quantity))}
            </p>
          </div>
          <span className="shrink-0 text-[13px] font-semibold tabular-nums text-muted-foreground">
            {formatCurrency(Number(a.total_value))}
          </span>
        </button>
      ))}
    </div>
  );
}
