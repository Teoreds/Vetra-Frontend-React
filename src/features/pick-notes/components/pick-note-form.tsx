import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, PackageCheck } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { OrderSearchSelect } from "./order-search-select";
import { useOrder } from "@/features/orders/hooks/use-order";
import { useArticles } from "@/features/articles/hooks/use-articles";
import {
  usePartyLocations,
  type PartyLocationWithAddress,
} from "@/features/parties/hooks/use-party-locations";
import { useWarehouses } from "@/features/warehouses/hooks/use-warehouses";
import { ordersApi } from "@/features/orders/api/orders.api";
import { orderKeys } from "@/features/orders/api/orders.queries";
import type { OrderOut, OrderRowOut } from "@/features/orders/types/order.types";

// ── Types ────────────────────────────────────────────────────────────

interface PickNoteRowDraft {
  key: string; // stable React key
  selected: boolean;
  article_guid: string;
  article_code: string;
  article_description: string;
  unit_of_measure_code: string;
  order_quantity: number;
  picked_quantity: number;
  remaining_quantity: number;
  quantity_to_pick: number;
  source_order_row_guid: string;
}

interface PickNoteFormProps {
  defaultOrderGuid?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

function formatAddress(loc: PartyLocationWithAddress): string {
  const parts = [loc.address_line, loc.city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : loc.type_code;
}

function buildRows(
  order: OrderOut & { rows?: OrderRowOut[] },
  articleMap: Map<string, { code: string; description: string }>,
): PickNoteRowDraft[] {
  return (order.rows ?? []).map((row) => {
    const article = articleMap.get(row.article_guid);
    const orderQty = parseFloat(row.quantity) || 0;
    const pickedQty =
      parseFloat(
        (row as OrderRowOut & { picked_quantity?: string }).picked_quantity ??
          "0",
      ) || 0;
    const remaining = Math.max(0, orderQty - pickedQty);

    return {
      key: row.guid,
      selected: false,
      article_guid: row.article_guid,
      article_code: article?.code ?? row.article_guid.slice(0, 8),
      article_description: article?.description ?? "",
      unit_of_measure_code: row.unit_of_measure_code ?? "",
      order_quantity: orderQty,
      picked_quantity: pickedQty,
      remaining_quantity: remaining,
      quantity_to_pick: remaining,
      source_order_row_guid: row.guid,
    };
  });
}

function resolveAddress(
  order: OrderOut,
  locations: PartyLocationWithAddress[],
  type: "SHIPPING" | "BILLING",
): string {
  const fromOrder =
    type === "SHIPPING"
      ? order.shipping_location_guid
      : order.billing_location_guid;
  if (fromOrder) return fromOrder;
  return (
    locations.find((l) => l.type_code === type && l.is_primary)
      ?.location_guid ?? ""
  );
}

// ── Component ────────────────────────────────────────────────────────

export function PickNoteForm({ defaultOrderGuid }: PickNoteFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ── Plain state (no react-hook-form) ───────────────────────────
  const [orderGuid, setOrderGuid] = useState(defaultOrderGuid ?? "");
  const [rows, setRows] = useState<PickNoteRowDraft[]>([]);
  const [shippingGuid, setShippingGuid] = useState("");
  const [billingGuid, setBillingGuid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Track which order's data we already loaded into state
  const [loadedOrderGuid, setLoadedOrderGuid] = useState("");

  // ── Queries ────────────────────────────────────────────────────
  const { data: order, isLoading: isLoadingOrder } = useOrder(orderGuid || "");
  const { data: articlesData } = useArticles({ limit: 200 });
  const { data: warehousesData } = useWarehouses();
  const { data: locations = [], isLoading: isLoadingLocations } =
    usePartyLocations(order?.party_guid || undefined);

  const articleMap = useMemo(() => {
    const map = new Map<string, { code: string; description: string }>();
    if (articlesData?.items) {
      for (const a of articlesData.items) {
        map.set(a.guid, {
          code: a.code ?? a.guid.slice(0, 8),
          description: a.description ?? "",
        });
      }
    }
    return map;
  }, [articlesData]);

  const warehouseGuid = warehousesData?.items?.[0]?.guid ?? "";

  // ── Populate rows + addresses when order data arrives ──────────

  useEffect(() => {
    if (!order || order.guid !== orderGuid) return;
    if (isLoadingLocations) return;
    if (loadedOrderGuid === orderGuid) return;

    const typedOrder = order as OrderOut & { rows?: OrderRowOut[] };
    setRows(buildRows(typedOrder, articleMap));
    setShippingGuid(resolveAddress(order, locations, "SHIPPING"));
    setBillingGuid(resolveAddress(order, locations, "BILLING"));
    setLoadedOrderGuid(orderGuid);
  }, [order, orderGuid, articleMap, locations, isLoadingLocations, loadedOrderGuid]);

  // ── Derived ────────────────────────────────────────────────────
  const shippingLocations = locations.filter(
    (l) => l.type_code === "SHIPPING",
  );
  const billingLocations = locations.filter((l) => l.type_code === "BILLING");

  const allSelected =
    rows.length > 0 &&
    rows.every((r) => r.selected || r.remaining_quantity === 0);
  const someSelected = rows.some((r) => r.selected);

  // ── Handlers ───────────────────────────────────────────────────
  const handleOrderChange = useCallback((guid: string) => {
    setOrderGuid(guid);
    setRows([]);
    setShippingGuid("");
    setBillingGuid("");
    setLoadedOrderGuid("");
    setSubmitError(null);
  }, []);

  function toggleSelectAll() {
    const next = !allSelected;
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        selected: r.remaining_quantity > 0 ? next : false,
      })),
    );
  }

  function toggleRow(index: number) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r)),
    );
  }

  function setRowQuantity(index: number, qty: number) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, quantity_to_pick: qty } : r)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const selectedRows = rows.filter(
      (r) => r.selected && r.quantity_to_pick > 0,
    );

    if (selectedRows.length === 0) {
      setSubmitError("Seleziona almeno una riga con quantità da prelevare.");
      return;
    }

    for (const row of selectedRows) {
      if (row.quantity_to_pick > row.remaining_quantity) {
        setSubmitError(
          `La quantità per ${row.article_code} supera il rimanente (${row.remaining_quantity}).`,
        );
        return;
      }
    }

    if (!warehouseGuid) {
      setSubmitError("Nessun magazzino disponibile.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: pickNote, error } =
        await ordersApi.createPickNoteFromOrder(orderGuid, warehouseGuid);
      if (error || !pickNote)
        throw new Error("Errore nella creazione della nota di prelievo.");

      await queryClient.invalidateQueries({
        queryKey: orderKeys.detail(orderGuid),
      });
      navigate(`/orders/${orderGuid}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Errore durante la creazione.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seleziona Ordine */}
      <Card>
        <CardHeader>
          <h2 className="text-[15px] font-semibold">Seleziona Ordine</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <OrderSearchSelect
            value={orderGuid}
            onChange={handleOrderChange}
          />

          {orderGuid && isLoadingOrder && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Caricamento ordine…
            </div>
          )}

          {order && (
            <div className="grid grid-cols-2 gap-4">
              {/* Spedizione */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[13px] font-medium">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Indirizzo di Spedizione
                  {isLoadingLocations && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </label>
                {!isLoadingLocations && shippingLocations.length === 0 ? (
                  <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-[13px] text-muted-foreground">
                    Nessun indirizzo di spedizione.
                  </p>
                ) : (
                  <Select
                    value={shippingGuid}
                    onValueChange={setShippingGuid}
                    disabled={isLoadingLocations}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nessuna preferenza…" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingLocations.map((loc) => (
                        <SelectItem key={loc.guid} value={loc.location_guid}>
                          {formatAddress(loc)}
                          {loc.is_primary ? " (Primario)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Fatturazione */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[13px] font-medium">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Indirizzo di Fatturazione
                  {isLoadingLocations && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </label>
                {!isLoadingLocations && billingLocations.length === 0 ? (
                  <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-[13px] text-muted-foreground">
                    Nessun indirizzo di fatturazione.
                  </p>
                ) : (
                  <Select
                    value={billingGuid}
                    onValueChange={setBillingGuid}
                    disabled={isLoadingLocations}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nessuna preferenza…" />
                    </SelectTrigger>
                    <SelectContent>
                      {billingLocations.map((loc) => (
                        <SelectItem key={loc.guid} value={loc.location_guid}>
                          {formatAddress(loc)}
                          {loc.is_primary ? " (Primario)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Righe da Prelevare */}
      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Righe da Prelevare</h2>
              <label className="flex items-center gap-2 text-[13px] text-muted-foreground cursor-pointer">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
                Seleziona tutto
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Articolo</TableHead>
                    <TableHead className="w-20 text-right">U.M.</TableHead>
                    <TableHead className="w-24 text-right">Ordinato</TableHead>
                    <TableHead className="w-24 text-right">Prelevato</TableHead>
                    <TableHead className="w-28 text-right">
                      Qtà da Prelevare
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => {
                    const isFullyPicked = row.remaining_quantity === 0;
                    return (
                      <TableRow
                        key={row.key}
                        className={isFullyPicked ? "opacity-40" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={row.selected}
                            onCheckedChange={() => toggleRow(index)}
                            disabled={isFullyPicked}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-[13px] font-medium">
                              {row.article_code}
                            </p>
                            {row.article_description && (
                              <p className="text-[11px] text-muted-foreground truncate max-w-[250px]">
                                {row.article_description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-[13px] text-muted-foreground">
                          {row.unit_of_measure_code || "—"}
                        </TableCell>
                        <TableCell className="text-right text-[13px] tabular-nums">
                          {row.order_quantity}
                        </TableCell>
                        <TableCell className="text-right text-[13px] tabular-nums text-muted-foreground">
                          {row.picked_quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          <input
                            type="number"
                            min={0}
                            max={row.remaining_quantity}
                            step="any"
                            value={row.quantity_to_pick}
                            onChange={(e) =>
                              setRowQuantity(
                                index,
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            disabled={isFullyPicked || !row.selected}
                            className="w-20 rounded-md border border-border/60 bg-background px-2 py-1 text-right text-[13px] tabular-nums outline-none transition-all focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {submitError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-[13px] text-destructive">{submitError}</p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !someSelected}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Creazione…
              </>
            ) : (
              <>
                <PackageCheck className="mr-1.5 h-4 w-4" />
                Crea Nota di Prelievo
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
