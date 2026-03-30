import { useState, useMemo } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Loader2, FileText, Truck, MapPin, Calendar, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { DatePicker } from "@/shared/ui/date-picker";
import { useShippingPickNote } from "../hooks/use-shipping-pick-note";
import { useArticles } from "@/features/articles/hooks/use-articles";
import { useParties } from "@/features/parties/hooks/use-parties";
import { useLocationsMap } from "@/features/parties/hooks/use-locations-map";
import { shipmentsApi } from "../api/shipments.api";
import { shipmentKeys } from "../api/shipments.queries";
import { pickNoteKeys } from "@/features/pick-notes/api/pick-notes.queries";

interface CreateDdtPanelProps {
  pickNoteGuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDdtPanel({
  pickNoteGuid,
  open,
  onOpenChange,
}: CreateDdtPanelProps) {
  const queryClient = useQueryClient();
  const { data: pickNote, isLoading } = useShippingPickNote(pickNoteGuid);
  const { data: articlesData } = useArticles({ limit: 200 });
  const { data: partiesData } = useParties({ limit: 200 });

  const articleMap = useMemo(
    () => new Map((articlesData?.items ?? []).map((a) => [a.guid, a])),
    [articlesData],
  );

  // Resolve customer name
  const customerParty = useMemo(() => {
    if (!pickNote?.party_guid || !partiesData?.items) return null;
    return partiesData.items.find((p) => p.guid === pickNote.party_guid) ?? null;
  }, [pickNote?.party_guid, partiesData]);

  // Resolve shipping address for display
  const locationGuids = useMemo(
    () => (pickNote?.shipping_location_guid ? [pickNote.shipping_location_guid] : []),
    [pickNote?.shipping_location_guid],
  );
  const { data: locationsMap } = useLocationsMap(locationGuids);
  const shippingAddress = pickNote?.shipping_location_guid
    ? locationsMap?.get(pickNote.shipping_location_guid)
    : null;

  // Carriers
  const carriers = useMemo(
    () => (partiesData?.items ?? []).filter((p) => p.type_code === "CARRIER"),
    [partiesData],
  );

  const [carrierGuid, setCarrierGuid] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setCarrierGuid("");
      setDeliveryDate("");
      setSubmitError(null);
    }
    onOpenChange(next);
  }

  async function handleSubmit() {
    if (!pickNote || !pickNote.party_guid || !pickNote.shipping_location_guid) return;
    setSubmitError(null);

    if (!deliveryDate) {
      setSubmitError("Seleziona la data di consegna.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: deliveryNote, error } = await shipmentsApi.createDeliveryNote(pickNote.guid, {
        customer_party_guid: pickNote.party_guid,
        shipping_location_guid: pickNote.shipping_location_guid,
        carrier_party_guid: carrierGuid || null,
        delivery_date: deliveryDate,
      });

      if (error || !deliveryNote) throw new Error("Errore durante la creazione del DDT.");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.pickNotes() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.deliveryNotes() }),
        queryClient.invalidateQueries({ queryKey: pickNoteKeys.lists() }),
      ]);

      handleOpenChange(false);

      // Download PDF in background after panel closes
      shipmentsApi.downloadDeliveryNotePdf(deliveryNote.guid).catch(() => {
        // silent — DDT already created successfully
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Errore durante la creazione del DDT.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border/80 bg-background shadow-[0_0_40px_-12px_rgba(0,0,0,0.25)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-300",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <div>
              <DialogPrimitive.Title className="text-base font-semibold">
                Crea Documento di Trasporto
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-[13px] text-muted-foreground">
                Genera il DDT dalla nota di prelievo controllata.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {pickNote && (
              <>
                {/* Riepilogo nota */}
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Nota di prelievo
                  </p>
                  <p className="text-[13px] font-semibold text-primary">
                    #{pickNote.guid.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {pickNote.rows?.length ?? 0} righe &middot;{" "}
                    {pickNote.weight ? `${pickNote.weight} kg` : "Peso n/d"} &middot;{" "}
                    {pickNote.packages ? `${pickNote.packages} colli` : "Colli n/d"}
                  </p>
                </div>

                {/* Righe (read-only) */}
                <div className="space-y-2">
                  <h3 className="text-[13px] font-semibold">Righe</h3>
                  <div className="rounded-lg border border-border/60 divide-y divide-border/40">
                    {pickNote.rows?.map((row) => {
                      const article = articleMap.get(row.article_guid);
                      return (
                        <div
                          key={row.guid}
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium truncate">
                              {article?.description ?? row.article_guid.slice(0, 8)}
                            </p>
                            {article && (
                              <p className="text-[11px] text-muted-foreground">{article.code}</p>
                            )}
                          </div>
                          <span className="shrink-0 text-[13px] font-medium tabular-nums">
                            {parseFloat(row.quantity)}
                          </span>
                          <Badge
                            variant={row.source_type_code === "COMMITMENT" ? "default" : "secondary"}
                            className="shrink-0 text-[10px]"
                          >
                            {row.source_type_code === "COMMITMENT" ? "Impegno" : row.source_type_code === "STOCK" ? "Stock" : row.source_type_code}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cliente (read-only) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Cliente
                  </label>
                  <div className="flex h-9 w-full items-center rounded-lg border border-border/60 bg-muted/40 px-3 text-[13px] text-muted-foreground">
                    {customerParty?.description ?? (pickNote.party_guid ? `#${pickNote.party_guid.slice(0, 8)}` : "Non disponibile")}
                  </div>
                </div>

                {/* Indirizzo spedizione (read-only) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    Indirizzo di spedizione
                  </label>
                  <div className="flex h-9 w-full items-center rounded-lg border border-border/60 bg-muted/40 px-3 text-[13px] text-muted-foreground">
                    {shippingAddress
                      ? [shippingAddress.address_line, shippingAddress.city].filter(Boolean).join(", ")
                      : pickNote.shipping_location_guid
                        ? "Caricamento…"
                        : "Non disponibile"}
                  </div>
                </div>

                {/* Vettore (opzionale) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    Vettore
                    <span className="text-[11px] font-normal text-muted-foreground">(opzionale)</span>
                  </label>
                  <Select value={carrierGuid} onValueChange={setCarrierGuid}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona vettore…" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map((c) => (
                        <SelectItem key={c.guid} value={c.guid}>
                          {c.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data consegna */}
                <div
                  className={cn(
                    "rounded-xl border p-4 space-y-3 transition-colors",
                    !deliveryDate
                      ? "border-amber-200 bg-amber-50/40"
                      : "border-emerald-200 bg-emerald-50/40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className={`h-4 w-4 ${!deliveryDate ? "text-amber-500" : "text-emerald-500"}`} />
                    <h3 className="text-[13px] font-semibold">Data di consegna</h3>
                    {!deliveryDate && (
                      <Badge variant="secondary" className="ml-auto border-amber-200 bg-amber-100 text-amber-700 text-[10px]">
                        Richiesta
                      </Badge>
                    )}
                  </div>
                  <DatePicker
                    value={deliveryDate}
                    onChange={(v) => setDeliveryDate(v)}
                    placeholder="Seleziona data…"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/60 px-6 py-4 space-y-3">
            {submitError && (
              <p className="text-[11px] font-medium text-destructive">{submitError}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting || !deliveryDate || !pickNote?.shipping_location_guid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Creazione…
                  </>
                ) : (
                  <>
                    <FileText className="mr-1.5 h-4 w-4" />
                    Crea DDT
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
