import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { formatCurrency } from "@/shared/lib/utils";
import type { QuoteRowDraft } from "./new-quote-step-items";

const VAT_OPTIONS = [0, 0.04, 0.1, 0.22] as const;

interface NewQuoteSummaryCardProps {
  rows: QuoteRowDraft[];
  vatRate: number;
  onVatRateChange: (rate: number) => void;
  currency?: string;
  currencyRate?: number;
}

function computeTotals(rows: QuoteRowDraft[]) {
  let totalGross = 0;
  let totalDiscount = 0;

  for (const row of rows) {
    const qty = Number(row.quantity) || 0;
    const price = Number(row.unit_price) || 0;
    const discPct = Number(row.discount_percent) || 0;
    const rowGross = qty * price;
    const rowDiscount = Number(((rowGross * discPct) / 100).toFixed(2));
    totalGross = Number((totalGross + rowGross).toFixed(2));
    totalDiscount = Number((totalDiscount + rowDiscount).toFixed(2));
  }

  return { totalGross, totalDiscount };
}

export function NewQuoteSummaryCard({
  rows,
  vatRate,
  onVatRateChange,
  currency = "EUR",
  currencyRate = 1,
}: NewQuoteSummaryCardProps) {
  const { totalGross, totalDiscount } = computeTotals(rows);
  const totalNet = Number((totalGross - totalDiscount).toFixed(2));
  const totalVat = Number((totalNet * vatRate).toFixed(2));
  const grandTotal = Number((totalNet + totalVat).toFixed(2));
  const vatPctLabel = `${(vatRate * 100).toFixed(0)}%`;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <h3 className="text-sm font-semibold">Riepilogo</h3>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Imponibile Lordo</span>
            <span className="text-[13px] font-medium">
              {formatCurrency(currencyRate * totalGross, { currency })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Sconto Totale</span>
            <span className="text-[13px] font-medium text-destructive">
              {totalDiscount > 0
                ? `−${formatCurrency(currencyRate * totalDiscount, { currency })}`
                : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Imponibile Netto</span>
            <span className="text-[13px] font-medium">
              {formatCurrency(currencyRate * totalNet, { currency })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">
              IVA (
              <select
                value={vatRate}
                onChange={(e) => onVatRateChange(parseFloat(e.target.value))}
                className="border-none bg-transparent text-[13px] text-muted-foreground outline-none cursor-pointer hover:text-foreground transition-colors"
              >
                {VAT_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {(v * 100).toFixed(0)}%
                  </option>
                ))}
              </select>
              )
            </span>
            <span className="text-[13px] font-medium">
              {totalVat > 0 ? formatCurrency(currencyRate * totalVat, { currency }) : "—"}
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Totale ({vatPctLabel})</span>
          <span className="text-base font-bold text-primary">
            {formatCurrency(currencyRate * grandTotal, { currency })}
          </span>
        </div>

        <div className="rounded-lg bg-muted/50 px-3 py-2.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Righe</span>
            <span className="font-semibold">{rows.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
