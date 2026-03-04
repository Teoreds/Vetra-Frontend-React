import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2, PenLine } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { ordersApi } from "../api/orders.api";
import { orderKeys } from "../api/orders.queries";
import { useParties } from "@/features/parties/hooks/use-parties";
import { usePartyLocations } from "@/features/parties/hooks/use-party-locations";
import { useWarehouseWorkers } from "@/features/warehouses/hooks/use-warehouse-workers";
import { CalendarDays, User, MapPin } from "lucide-react";
import type { Step1Data } from "./new-order-step-details";
import type { OrderRowDraft } from "./new-order-step-items";

interface NewOrderStepReviewProps {
  orderGuid: string;
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
            <TableHead className="w-20 text-right">Sconto %</TableHead>
            <TableHead className="w-28 text-right">Subtotale</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => {
            const qty = Number(row.quantity) || 0;
            const price = Number(row.unit_price) || 0;
            const discPct = Number(row.discount_percent) || 0;
            const subtotal = Number((qty * price * (1 - discPct / 100)).toFixed(2));
            return (
              <TableRow key={i}>
                <TableCell>
                  <p className="font-medium">{row.article_description}</p>
                  <p className="text-[11px] text-muted-foreground">{row.article_code}</p>
                </TableCell>
                <TableCell className="text-right">{row.quantity}</TableCell>
                <TableCell className="text-right">{fmt(Number(row.unit_price) || 0)}</TableCell>
                <TableCell className="text-right">
                  {discPct > 0 ? `${discPct}%` : "—"}
                </TableCell>
                <TableCell className="text-right font-medium">{fmt(subtotal)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function NewOrderStepReview({
  orderGuid,
  step1Data,
  availableRows,
  commitmentRows,
  onBack,
}: NewOrderStepReviewProps) {
  const navigate = useNavigate();
  const [workerGuid, setWorkerGuid] = useState<string>("");

  const { data: partiesData } = useParties({ limit: 200 });
  const party = partiesData?.items.find((p) => p.guid === step1Data.party_guid);
  const { data: locations = [] } = usePartyLocations(step1Data.party_guid);
  const shippingLocation = step1Data.shipping_location_guid
    ? locations.find((l) => l.location_guid === step1Data.shipping_location_guid)
    : undefined;

  const { data: workersData, isLoading: isLoadingWorkers } = useWarehouseWorkers();
  const workers = workersData?.items ?? [];

  // Fetch official totals from backend
  const { data: orderData, isLoading: isLoadingOrder } = useQuery({
    queryKey: orderKeys.detail(orderGuid),
    queryFn: async () => {
      const { data, error } = await ordersApi.get(orderGuid);
      if (error) throw error;
      return data;
    },
  });

  const order = orderData as Record<string, unknown> | undefined;

  const totalGross = Number(order?.total_gross ?? 0);
  const totalDiscount = Number(order?.total_discount ?? 0);
  const totalNet = Number(order?.total_net ?? totalGross - totalDiscount);
  const vatRate = Number(order?.vat_rate ?? 0);
  const totalVat = Number(order?.total_vat ?? 0);
  const grandTotal = Number(order?.total ?? totalNet + totalVat);

  const isVatExempt = vatRate === 0;
  const vatPctLabel = `${(vatRate * 100).toFixed(0)}%`;

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-4">
        {/* Order info */}
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold">Riepilogo Ordine</h2>
            <p className="text-[13px] text-muted-foreground">
              L'ordine è stato creato come bozza. Verifica i dati.
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

        {/* VAT Breakdown from backend */}
        <Card>
          <CardHeader>
            <h3 className="text-[14px] font-semibold">Riepilogo IVA</h3>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingOrder ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-[13px] text-muted-foreground">Caricamento totali…</span>
              </div>
            ) : (
              <div className="space-y-3">
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
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">
                      {isVatExempt ? "IVA esente (lettera d'intento)" : `IVA (${vatPctLabel})`}
                    </span>
                    <span className="text-[13px] font-medium">
                      {isVatExempt ? "€ 0,00" : fmt(totalVat)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold">Totale</span>
                    <span className="text-[16px] font-bold text-primary">{fmt(grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Firma operatore */}
        <Card className={!workerGuid ? "border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20" : "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PenLine className={`h-4 w-4 ${!workerGuid ? "text-amber-500" : "text-emerald-500"}`} />
              <h3 className="text-[14px] font-semibold">Firma Operatore</h3>
              {!workerGuid && (
                <Badge variant="secondary" className="ml-auto border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950 dark:text-amber-400">
                  Richiesta
                </Badge>
              )}
            </div>
            <p className="text-[13px] text-muted-foreground">
              Seleziona il tuo nome per confermare la presa in carico dell'ordine.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingWorkers ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-[13px] text-muted-foreground">Caricamento operatori…</span>
              </div>
            ) : (
              <Select value={workerGuid} onValueChange={setWorkerGuid}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona operatore…" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((w) => (
                    <SelectItem key={w.guid} value={w.guid}>
                      {w.name} {w.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Indietro
          </Button>
          <Button
            disabled={!workerGuid}
            onClick={() => navigate(`/orders/${orderGuid}`)}
          >
            <ExternalLink className="mr-1.5 h-4 w-4" />
            Vai all'Ordine
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 shrink-0">
        <Card className="sticky top-4">
          <CardHeader>
            <h3 className="text-[14px] font-semibold">Stato</h3>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">Stato ordine</span>
              <Badge variant="secondary">DRAFT</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">Righe salvate</span>
              <span className="text-[13px] font-semibold">
                {availableRows.length + commitmentRows.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">Operatore</span>
              <span className="text-[13px] font-semibold">
                {workerGuid
                  ? (() => {
                      const w = workers.find((x) => x.guid === workerGuid);
                      return w ? `${w.name} ${w.surname}` : "—";
                    })()
                  : "—"}
              </span>
            </div>
            <Separator />
            <p className="text-[12px] text-muted-foreground">
              L'ordine è stato salvato come bozza con tutte le righe.
              Seleziona il tuo nome per procedere.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
