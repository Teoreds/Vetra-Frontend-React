// Placeholder: In production, fetch stock/inventory data for this warehouse.

interface StoredArticlesSectionProps {
  warehouseGuid: string;
}

export function StoredArticlesSection({ warehouseGuid: _warehouseGuid }: StoredArticlesSectionProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Stored Articles
      </h3>
      <p className="text-[13px] text-muted-foreground">
        Stock levels for this warehouse will appear here.
      </p>
    </div>
  );
}
