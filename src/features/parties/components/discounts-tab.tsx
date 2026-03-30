import { Plus, Percent, FileText } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader, CardContent } from "@/shared/ui/card";
import { formatDate, formatCurrency } from "@/shared/lib/utils";
import { useArticleTypes } from "@/features/articles/hooks/use-article-lookups";
import { usePartyDiscounts } from "../hooks/use-party-discounts";
import { useIntentLetters } from "../hooks/use-intent-letters";

interface DiscountsTabProps {
  partyGuid: string;
  onAddDiscount: () => void;
  onAddIntentLetter: () => void;
}

export function DiscountsTab({ partyGuid, onAddDiscount, onAddIntentLetter }: DiscountsTabProps) {
  const { data: discountsData, isLoading: loadingDiscounts } = usePartyDiscounts(partyGuid);
  const { data: lettersData, isLoading: loadingLetters } = useIntentLetters(partyGuid);
  const { data: articleTypes = [] } = useArticleTypes();

  const discounts = discountsData?.items ?? [];
  const letters = lettersData?.items ?? [];

  const typeLabel = (code: string | null | undefined) => {
    if (!code) return "Tutti i tipi";
    return articleTypes.find((t) => t.code === code)?.description ?? code;
  };

  return (
    <div className="space-y-5">
      {/* Sconti */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold">Sconti</h2>
            </div>
            <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[12px]" onClick={onAddDiscount}>
              <Plus className="h-3.5 w-3.5" />
              Aggiungi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingDiscounts ? (
            <p className="py-6 text-center text-[13px] text-muted-foreground">Caricamento…</p>
          ) : discounts.length === 0 ? (
            <p className="rounded-lg border border-border/60 bg-muted/40 py-6 text-center text-[13px] text-muted-foreground">
              Nessuno sconto configurato.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border/60">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Tipo Articolo</th>
                    <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Sconto %</th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Stato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {discounts.map((d) => (
                    <tr key={d.guid} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 font-medium">{typeLabel(d.article_type_code)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{Number(d.discount_percent).toFixed(2)}%</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${d.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                          {d.is_active ? "Attivo" : "Inattivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lettere d'Intento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold">Lettere d'Intento</h2>
            </div>
            <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[12px]" onClick={onAddIntentLetter}>
              <Plus className="h-3.5 w-3.5" />
              Aggiungi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingLetters ? (
            <p className="py-6 text-center text-[13px] text-muted-foreground">Caricamento…</p>
          ) : letters.length === 0 ? (
            <p className="rounded-lg border border-border/60 bg-muted/40 py-6 text-center text-[13px] text-muted-foreground">
              Nessuna lettera d'intento registrata.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border/60">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Protocollo</th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Anno</th>
                    <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Importo Max</th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Validità</th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Stato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {letters.map((l) => (
                    <tr key={l.guid} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 font-medium">{l.protocol_number ?? "—"}</td>
                      <td className="px-3 py-2.5">{l.year}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatCurrency(Number(l.max_amount))}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {formatDate(l.valid_from)} → {formatDate(l.valid_to)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${l.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                          {l.is_active ? "Attiva" : "Inattiva"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
