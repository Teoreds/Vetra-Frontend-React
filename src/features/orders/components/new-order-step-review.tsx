import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useUnitOfMeasures } from "@/features/articles/hooks/use-article-lookups";
import { CalendarDays, User, MapPin } from "lucide-react";
import type { Step1Data } from "./new-order-step-details";
import { formatCurrency } from "@/shared/lib/utils";
import type { OrderRowDraft } from "./new-order-step-items";

interface NewOrderStepReviewProps {
  orderGuid: string;
  step1Data: Step1Data;
  availableRows: OrderRowDraft[];
  commitmentRows: OrderRowDraft[];
  onBack: () => void;
  mode?: "create" | "edit";
}

function ReadOnlyTable({
  rows,
  label,
  uomMap,
}: {
  rows: OrderRowDraft[];
  label: string;
  uomMap: Map<string, string>;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-[13px] font-semibold text-muted-foreground">{label}</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Articolo</TableHead>
            <TableHead className="w-16">Qtà</TableHead>
            <TableHead className="w-14 pl-4">UdM</TableHead>
            <TableHead className="w-28 pl-4 text-right whitespace-nowrap">Prezzo</TableHead>
            <TableHead className="w-20 pl-4 text-right whitespace-nowrap">Sconto %</TableHead>
            <TableHead className="w-28 text-right">Subtotale</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => {
            const qty = Number(row.quantity) || 0;
            const price = Number(row.unit_price) || 0;
            const discPct = Number(row.discount_percent) || 0;
            const subtotal = qty * price * (1 - discPct / 100);
            const uomLabel = row.unit_of_measure_code
              ? (uomMap.get(row.unit_of_measure_code) ?? row.unit_of_measure_code)
              : "—";
            return (
              <TableRow key={i}>
                <TableCell>
                  <p className="text-[13px] font-medium leading-tight">{row.article_description}</p>
                  <p className="text-[11px] text-muted-foreground">{row.article_code}</p>
                </TableCell>
                <TableCell className="text-[13px]">{qty}</TableCell>
                <TableCell className="pl-4 text-[11px] text-muted-foreground uppercase">{uomLabel}</TableCell>
                <TableCell className="pl-4 text-right text-[13px] tabular-nums">{formatCurrency(price)}</TableCell>
                <TableCell className="pl-4 text-right text-[13px] tabular-nums">
                  {discPct > 0 ? `${discPct}%` : "—"}
                </TableCell>
                <TableCell className="text-right text-[13px] font-medium tabular-nums">
                  {formatCurrency(subtotal)}
                </TableCell>
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
  mode = "create",
}: NewOrderStepReviewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [workerGuid, setWorkerGuid] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const { data: partiesData } = useParties({ limit: 200 });
  const party = partiesData?.items.find((p) => p.guid === step1Data.party_guid);
  const { data: locations = [] } = usePartyLocations(step1Data.party_guid);
  const shippingLocation = step1Data.shipping_location_guid
    ? locations.find((l) => l.location_guid === step1Data.shipping_location_guid)
    : undefined;

  const { data: workersData, isLoading: isLoadingWorkers } = useWarehouseWorkers();
  const workers = workersData?.items ?? [];
  const { data: uomList = [] } = useUnitOfMeasures();
  const uomMap = new Map(uomList.map((u) => [u.code, u.description]));

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


  async function handleConfirmAndNavigate() {
    setConfirmError(null);
    setIsConfirming(true);
    try {
      if (mode === "edit") {
        const { error: updateError } = await ordersApi.update(orderGuid, {
          warehouse_worker_guid: workerGuid || null,
        });
        if (updateError) {
          setConfirmError("Impossibile salvare le modifiche. Riprova.");
          return;
        }
      } else {
        const { error: updateError } = await ordersApi.update(orderGuid, {
          status_code: (order?.status_code as string) ?? "DRAFT",
          warehouse_worker_guid: workerGuid,
        });
        if (updateError) {
          setConfirmError("Impossibile salvare l'operatore. Riprova.");
          return;
        }
        const { error } = await ordersApi.confirm(orderGuid);
        if (error) {
          setConfirmError("Impossibile confermare l'ordine. Riprova.");
          return;
        }
      }
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderGuid) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      navigate(`/orders/${orderGuid}`);
    } catch {
      setConfirmError("Errore di rete. Riprova.");
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-4">
        {/* Order info */}
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold">
              {mode === "edit" ? "Riepilogo Modifiche" : "Riepilogo Ordine"}
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {mode === "edit"
                ? "Verifica le modifiche e salva l'ordine."
                : "Verifica i dati e conferma l'ordine."}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-[13px]">
                  <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Cliente</span>
                  <span className="font-medium truncate">{party?.description ?? "—"}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-[13px]">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">
                    {new Date(step1Data.order_date).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-[13px]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">Spedizione</span>
                <span className="font-medium">
                  {shippingLocation
                    ? [shippingLocation.address_line, shippingLocation.post_code, shippingLocation.city, shippingLocation.province].filter(Boolean).join(", ")
                    : "Non specificata"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rows */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Righe Ordine</h3>
              <Badge variant="secondary">{availableRows.length + commitmentRows.length} righe</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            <ReadOnlyTable
              rows={availableRows}
              label={`Articoli Disponibili (${availableRows.length})`}
              uomMap={uomMap}
            />
            {availableRows.length > 0 && commitmentRows.length > 0 && <Separator />}
            <ReadOnlyTable
              rows={commitmentRows}
              label={`Impegno Cliente (${commitmentRows.length})`}
              uomMap={uomMap}
            />
            {availableRows.length === 0 && commitmentRows.length === 0 && (
              <p className="py-4 text-center text-[13px] text-muted-foreground">
                Nessuna riga aggiunta.
              </p>
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
            disabled={!workerGuid || isConfirming}
            onClick={handleConfirmAndNavigate}
          >
            {isConfirming ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-1.5 h-4 w-4" />
            )}
            {mode === "edit" ? "Salva Modifiche" : "Conferma Ordine"}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-72 shrink-0">
        <div className="sticky top-4 space-y-4">
        {/* VAT Breakdown */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold">Riepilogo IVA</h3>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {isLoadingOrder ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-[13px] text-muted-foreground">Caricamento totali…</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Imponibile Lordo</span>
                  <span className="text-[13px] font-medium">{formatCurrency(totalGross)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Sconto Totale</span>
                  <span className="text-[13px] font-medium text-destructive">
                    {totalDiscount > 0 ? `−${formatCurrency(totalDiscount)}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Imponibile Netto</span>
                  <span className="text-[13px] font-medium">{formatCurrency(totalNet)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">
                    {isVatExempt ? "IVA esente (lettera d'intento)" : `IVA (${vatPctLabel})`}
                  </span>
                  <span className="text-[13px] font-medium">
                    {isVatExempt ? "€ 0,00" : formatCurrency(totalVat)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Totale</span>
                  <span className="text-base font-bold text-primary">{formatCurrency(grandTotal)}</span>
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
              <h3 className="text-sm font-semibold">Firma Operatore</h3>
              {!workerGuid && (
                <Badge variant="secondary" className="ml-auto border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950 dark:text-amber-400">
                  Richiesta
                </Badge>
              )}
            </div>
            <p className="text-[13px] text-muted-foreground">
              {mode === "edit"
                ? "Seleziona l'operatore responsabile della modifica."
                : "Seleziona il tuo nome per confermare la presa in carico."}
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
            {confirmError && (
              <p className="mt-2 text-[11px] font-medium text-destructive">{confirmError}</p>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
