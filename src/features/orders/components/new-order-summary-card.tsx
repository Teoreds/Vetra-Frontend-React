import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import type { OrderRowDraft } from "./new-order-step-items";

interface NewOrderSummaryCardProps {
  availableRows: OrderRowDraft[];
  commitmentRows: OrderRowDraft[];
  vatRate: number;
}

function computeTotals(rows: OrderRowDraft[]) {
  let totalGross = 0;
  let totalDiscount = 0;

  for (const row of rows) {
    const qty = Number(row.quantity) || 0;
    const price = Number(row.unit_price) || 0;
    const discPct = Number(row.discount_percent) || 0;
    const rowGross = qty * price;
    const rowDiscount = Number((rowGross * discPct / 100).toFixed(2));
    totalGross = Number((totalGross + rowGross).toFixed(2));
    totalDiscount = Number((totalDiscount + rowDiscount).toFixed(2));
  }

  return { totalGross, totalDiscount };
}

function fmt(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

export function NewOrderSummaryCard({ availableRows, commitmentRows, vatRate }: NewOrderSummaryCardProps) {
  const allRows = [...availableRows, ...commitmentRows];
  const { totalGross, totalDiscount } = computeTotals(allRows);
  const totalNet = Number((totalGross - totalDiscount).toFixed(2));
  const totalVat = Number((totalNet * vatRate).toFixed(2));
  const grandTotal = Number((totalNet + totalVat).toFixed(2));

  const availableTotals = computeTotals(availableRows);
  const commitmentTotals = computeTotals(commitmentRows);

  const vatPctLabel = `${(vatRate * 100).toFixed(0)}%`;

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
            <span className="text-[12px] font-medium">
              {fmt(availableTotals.totalGross - availableTotals.totalDiscount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">Impegno</span>
            <span className="text-[12px] font-medium">
              {fmt(commitmentTotals.totalGross - commitmentTotals.totalDiscount)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Imponibile Lordo</span>
            <span className="text-[13px] font-medium">{fmt(totalGross)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Sconto Totale</span>
            <span className="text-[13px] font-medium text-destructive">
              {totalDiscount > 0 ? `−${fmt(totalDiscount)}` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Imponibile Netto</span>
            <span className="text-[13px] font-medium">{fmt(totalNet)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">IVA ({vatPctLabel})</span>
            <span className="text-[13px] font-medium">
              {totalVat > 0 ? fmt(totalVat) : "—"}
            </span>
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
