import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import type { OrderRowDraft } from "./new-order-step-items";

interface NewOrderSummaryCardProps {
  availableRows: OrderRowDraft[];
  commitmentRows: OrderRowDraft[];
}

function computeTotals(rows: OrderRowDraft[]) {
  return rows.reduce(
    (acc, row) => {
      const qty = Number(row.quantity) || 0;
      const price = Number(row.unit_price) || 0;
      const vatPct = row.vat_code ? Number(row.vat_code) || 0 : 0;
      const lineTotal = qty * price;
      const lineVat = lineTotal * (vatPct / 100);
      return {
        imponibile: acc.imponibile + lineTotal,
        iva: acc.iva + lineVat,
      };
    },
    { imponibile: 0, iva: 0 },
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

export function NewOrderSummaryCard({ availableRows, commitmentRows }: NewOrderSummaryCardProps) {
  const allRows = [...availableRows, ...commitmentRows];
  const totals = computeTotals(allRows);
  const grandTotal = totals.imponibile + totals.iva;

  const availableTotals = computeTotals(availableRows);
  const commitmentTotals = computeTotals(commitmentRows);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <h3 className="text-[14px] font-semibold">Riepilogo</h3>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Breakdown by box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">Disponibili</span>
            <span className="text-[12px] font-medium">{fmt(availableTotals.imponibile)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">Impegno</span>
            <span className="text-[12px] font-medium">{fmt(commitmentTotals.imponibile)}</span>
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Totale Imponibile</span>
            <span className="text-[13px] font-medium">{fmt(totals.imponibile)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">IVA</span>
            <span className="text-[13px] font-medium">
              {totals.iva > 0 ? fmt(totals.iva) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Sconto Totale</span>
            <span className="text-[13px] font-medium text-muted-foreground">—</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold">Totale</span>
          <span className="text-[16px] font-bold text-primary">{fmt(grandTotal)}</span>
        </div>

        {/* Row counts */}
        <div className="rounded-lg bg-muted/50 px-3 py-2.5 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Righe disponibili</span>
            <span className="font-semibold">{availableRows.length}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Righe impegno</span>
            <span className="font-semibold">{commitmentRows.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
