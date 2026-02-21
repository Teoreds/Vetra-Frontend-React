import type { ArticleOut } from "../types/article.types";

interface ArticleOverviewProps {
  article: ArticleOut;
}

export function ArticleOverview({ article }: ArticleOverviewProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Dettagli Articolo
      </h3>
      <dl className="space-y-2.5">
        <div className="flex justify-between">
          <dt className="text-[13px] text-muted-foreground">Codice</dt>
          <dd className="font-mono text-[13px] font-medium">{article.code}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[13px] text-muted-foreground">Descrizione</dt>
          <dd className="text-[13px] font-medium">{article.description}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[13px] text-muted-foreground">Stato</dt>
          <dd className="text-[13px] font-medium">{article.is_active ? "Active" : "Inactive"}</dd>
        </div>
      </dl>
    </div>
  );
}
