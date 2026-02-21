// Placeholder: In production, fetch orders that contain this article.
// This would require a backend endpoint or client-side cross-referencing.

interface RelatedOrdersSectionProps {
  articleGuid: string;
}

export function RelatedOrdersSection({ articleGuid: _articleGuid }: RelatedOrdersSectionProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Ordini collegati
      </h3>
      <p className="text-[13px] text-muted-foreground">
        Gli ordini che contengono questo articolo compariranno qui.
      </p>
    </div>
  );
}
