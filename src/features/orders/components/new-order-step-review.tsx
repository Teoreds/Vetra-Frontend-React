import { ArrowLeft, CheckCircle2, CalendarDays, User, MapPin } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { NewOrderSummaryCard } from "./new-order-summary-card";
import { useCreateOrderWithRows } from "../hooks/use-create-order-with-rows";
import { useParties } from "@/features/parties/hooks/use-parties";
import { usePartyLocations } from "@/features/parties/hooks/use-party-locations";
import type { Step1Data } from "./new-order-step-details";
import type { OrderRowDraft } from "./new-order-step-items";

interface NewOrderStepReviewProps {
  step1Data: Step1Data;
  availableRows: OrderRowDraft[];
  commitmentRows: OrderRowDraft[];
  onBack: () => void;
}

function fmt(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

function ReadOnlyTable({ rows, label }: { rows: OrderRowDraft[]; label: string }) {
  if (rows.length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-[13px] font-semibold text-muted-foreground">{label}</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Articolo</TableHead>
            <TableHead className="w-20 text-right">Qtà</TableHead>
            <TableHead className="w-28 text-right">Prezzo</TableHead>
            <TableHead className="w-20 text-right">IVA %</TableHead>
            <TableHead className="w-28 text-right">Subtotale</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => {
            const total = (Number(row.quantity) || 0) * (Number(row.unit_price) || 0);
            return (
              <TableRow key={i}>
                <TableCell>
                  <p className="font-medium">{row.article_description}</p>
                  <p className="text-[11px] text-muted-foreground">{row.article_code}</p>
                </TableCell>
                <TableCell className="text-right">{row.quantity}</TableCell>
                <TableCell className="text-right">{fmt(Number(row.unit_price) || 0)}</TableCell>
                <TableCell className="text-right">{row.vat_code || "—"}</TableCell>
                <TableCell className="text-right font-medium">{fmt(total)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function NewOrderStepReview({
  step1Data,
  availableRows,
  commitmentRows,
  onBack,
}: NewOrderStepReviewProps) {
  const { mutate, isPending, error } = useCreateOrderWithRows();
  const { data: partiesData } = useParties({ limit: 200 });
  const party = partiesData?.items.find((p) => p.guid === step1Data.party_guid);
  const { data: locations = [] } = usePartyLocations(step1Data.party_guid);
  const shippingLocation = step1Data.shipping_location_guid
    ? locations.find((l) => l.location_guid === step1Data.shipping_location_guid)
    : undefined;

  function handleConfirm() {
    mutate({ step1: step1Data, availableRows, commitmentRows });
  }

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-4">
        {/* Order info */}
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold">Riepilogo Ordine</h2>
            <p className="text-[13px] text-muted-foreground">
              Verifica i dati prima di confermare la creazione.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Cliente
                  </p>
                  <p className="text-[13px] font-medium">{party?.description ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Data Ordine
                  </p>
                  <p className="text-[13px] font-medium">
                    {new Date(step1Data.order_date).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Spedizione
                  </p>
                  <p className="text-[13px] font-medium">
                    {shippingLocation
                      ? `${shippingLocation.type_code.charAt(0).toUpperCase() + shippingLocation.type_code.slice(1).toLowerCase()}${shippingLocation.is_primary ? " — Primario" : ""}`
                      : "Non specificata"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rows */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-semibold">Righe Ordine</h3>
              <Badge variant="secondary">{availableRows.length + commitmentRows.length} righe</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            <ReadOnlyTable
              rows={availableRows}
              label={`Articoli Disponibili (${availableRows.length})`}
            />
            {availableRows.length > 0 && commitmentRows.length > 0 && <Separator />}
            <ReadOnlyTable
              rows={commitmentRows}
              label={`Impegno Cliente (${commitmentRows.length})`}
            />
            {availableRows.length === 0 && commitmentRows.length === 0 && (
              <p className="py-4 text-center text-[13px] text-muted-foreground">
                Nessuna riga aggiunta.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
            <p className="text-[13px] text-destructive">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Indietro
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            {isPending ? "Creazione in corso…" : "Conferma e Crea Ordine"}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 shrink-0">
        <NewOrderSummaryCard availableRows={availableRows} commitmentRows={commitmentRows} />
      </div>
    </div>
  );
}
