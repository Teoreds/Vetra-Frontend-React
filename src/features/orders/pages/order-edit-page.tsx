import { useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  PenLine,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { DatePicker } from "@/shared/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { PartySearchSelect } from "@/features/parties/components/party-search-select";
import { usePartyLocations, type PartyLocationWithAddress } from "@/features/parties/hooks/use-party-locations";
import { useArticles } from "@/features/articles/hooks/use-articles";
import { usePaymentMethods, usePaymentTerms, useOrderStatuses } from "@/shared/hooks/use-lookups";
import { useWarehouseWorkers } from "@/features/warehouses/hooks/use-warehouse-workers";
import { ArticleInlineSearch } from "../components/article-inline-search";
import { useOrder } from "../hooks/use-order";
import { ordersApi } from "../api/orders.api";
import { orderKeys } from "../api/orders.queries";
import type { ArticleOut } from "@/features/articles/types/article.types";

interface EditFormRow {
  article_guid: string;
  article_code: string;
  article_description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  unit_of_measure_code: string;
  availability_status_code: string;
  _serverGuid?: string;
}

interface EditForm {
  party_guid: string;
  order_date: string;
  status_code: string;
  shipping_location_guid: string;
  billing_location_guid: string;
  payment_method_guid: string;
  payment_term_guid: string;
  warehouse_worker_guid: string;
  rows: EditFormRow[];
}

function formatAddress(loc: PartyLocationWithAddress): string {
  const parts = [loc.address_line, loc.city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : loc.type_code;
}

function fmt(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

export function OrderEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<{ focus: () => void }>(null);

  const { data: order, isLoading } = useOrder(id!);
  const { data: articlesData } = useArticles({ limit: 200 });
  const { data: paymentMethods } = usePaymentMethods();
  const { data: paymentTerms } = usePaymentTerms();
  const { data: orderStatuses } = useOrderStatuses();
  const { data: workersData, isLoading: isLoadingWorkers } = useWarehouseWorkers();
  const workers = workersData?.items ?? [];

  const articleMap = useMemo(() => {
    const map = new Map<string, ArticleOut>();
    for (const a of articlesData?.items ?? []) map.set(a.guid, a);
    return map;
  }, [articlesData]);

  // Build initial rows from order
  const initialRows = useMemo(() => {
    if (!order?.rows) return undefined;
    return order.rows.map((row) => {
      const article = articleMap.get(row.article_guid);
      return {
        article_guid: row.article_guid,
        article_code: article?.code ?? row.article_guid.slice(0, 8),
        article_description: article?.description ?? "Articolo",
        quantity: parseFloat(row.quantity),
        unit_price: parseFloat(row.unit_price),
        discount_percent: parseFloat(row.discount_percent),
        unit_of_measure_code: row.unit_of_measure_code ?? "",
        availability_status_code: row.availability_status_code,
        _serverGuid: row.guid,
      };
    });
  }, [order, articleMap]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<EditForm>({
    values: order && initialRows
      ? {
          party_guid: order.party_guid,
          order_date: order.order_date,
          status_code: order.status_code,
          shipping_location_guid: order.shipping_location_guid ?? "",
          billing_location_guid: order.billing_location_guid ?? "",
          payment_method_guid: order.payment_method_guid ?? "",
          payment_term_guid: order.payment_term_guid ?? "",
          warehouse_worker_guid: order.warehouse_worker_guid ?? "",
          rows: initialRows,
        }
      : undefined,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "rows" });

  const selectedPartyGuid = watch("party_guid");
  const watchedRows = watch("rows");
  const { data: locations = [] } = usePartyLocations(selectedPartyGuid || undefined);
  const shippingLocations = locations.filter((l) => l.type_code === "SHIPPING");
  const billingLocations = locations.filter((l) => l.type_code === "BILLING");

  // Totals
  const totals = useMemo(() => {
    let net = 0;
    let gross = 0;
    for (const r of watchedRows ?? []) {
      const lineGross = (r.quantity ?? 0) * (r.unit_price ?? 0);
      const lineNet = lineGross * (1 - (r.discount_percent ?? 0) / 100);
      gross += lineGross;
      net += lineNet;
    }
    return { gross, net, discount: gross - net };
  }, [watchedRows]);

  if (isLoading || !order) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  function handleAddArticle(article: ArticleOut) {
    append({
      article_guid: article.guid,
      article_code: article.code,
      article_description: article.description,
      quantity: 1,
      unit_price: article.list_price ? Number(article.list_price) : 0,
      discount_percent: 0,
      unit_of_measure_code: article.unit_of_measure_code ?? "",
      availability_status_code: "AVAILABLE",
      _serverGuid: undefined,
    });
    setTimeout(() => searchRef.current?.focus(), 50);
  }

  const onSubmit = async (values: EditForm) => {
    setSaving(true);
    setError(null);

    try {
      // 1. Update order header
      const { error: updateErr } = await ordersApi.update(order.guid, {
        status_code: values.status_code,
        order_date: values.order_date,
        shipping_location_guid: values.shipping_location_guid || null,
        billing_location_guid: values.billing_location_guid || null,
        payment_method_guid: values.payment_method_guid || null,
        payment_term_guid: values.payment_term_guid || null,
        warehouse_worker_guid: values.warehouse_worker_guid || null,
      });
      if (updateErr) throw updateErr;

      // 2. Sync rows
      const originalGuids = new Set((order.rows ?? []).map((r) => r.guid));
      const currentServerGuids = new Set(
        values.rows.filter((r) => r._serverGuid).map((r) => r._serverGuid!),
      );

      // Delete removed rows
      for (const guid of originalGuids) {
        if (!currentServerGuids.has(guid)) {
          await ordersApi.deleteRow(guid);
        }
      }

      // Update existing rows / create new ones
      for (const row of values.rows) {
        if (row._serverGuid && originalGuids.has(row._serverGuid)) {
          await ordersApi.updateRow(row._serverGuid, {
            quantity: row.quantity,
            unit_price: row.unit_price,
            availability_status_code: row.availability_status_code,
          });
        } else {
          await ordersApi.createRow(order.guid, {
            article_guid: row.article_guid,
            quantity: row.quantity,
            unit_price: row.unit_price,
            discount_percent: row.discount_percent ?? 0,
            availability_status_code: row.availability_status_code || "AVAILABLE",
            unit_of_measure_code: row.unit_of_measure_code || null,
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id!) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      navigate(`/orders/${order.guid}`);
    } catch {
      setError("Impossibile salvare le modifiche. Riprova.");
    } finally {
      setSaving(false);
    }
  };

  const th = "px-2 h-7 text-foreground/60";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/orders/${order.guid}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">
            Modifica Ordine #{order.guid.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Modifica i dati, gli indirizzi e le righe dell'ordine.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-6">
        {/* Order details */}
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold">Dati Ordine</h2>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Cliente</label>
                <Controller
                  control={control}
                  name="party_guid"
                  render={({ field }) => (
                    <PartySearchSelect value={field.value} onChange={field.onChange} typeCode="CUSTOMER" />
                  )}
                />
                {errors.party_guid && (
                  <p className="text-[12px] text-destructive">{errors.party_guid.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Data Ordine</label>
                <Controller
                  control={control}
                  name="order_date"
                  render={({ field }) => (
                    <DatePicker value={field.value} onChange={field.onChange} placeholder="Seleziona data…" />
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Stato</label>
                <Controller
                  control={control}
                  name="status_code"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona…" />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((s) => (
                          <SelectItem key={s.code} value={s.code}>
                            {s.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Payment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Metodo di Pagamento</label>
                <Controller
                  control={control}
                  name="payment_method_guid"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nessuno…" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((pm) => (
                          <SelectItem key={pm.code} value={pm.code}>
                            {pm.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Termine di Pagamento</label>
                <Controller
                  control={control}
                  name="payment_term_guid"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nessuno…" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTerms.map((pt) => (
                          <SelectItem key={pt.code} value={pt.code}>
                            {pt.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Addresses */}
            {selectedPartyGuid && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium">Indirizzo di Spedizione</label>
                  {shippingLocations.length === 0 ? (
                    <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-[13px] text-muted-foreground">
                      Nessun indirizzo di spedizione.
                    </p>
                  ) : (
                    <Controller
                      control={control}
                      name="shipping_location_guid"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue placeholder="Nessuna preferenza…" /></SelectTrigger>
                          <SelectContent>
                            {shippingLocations.map((loc) => (
                              <SelectItem key={loc.guid} value={loc.location_guid}>
                                {formatAddress(loc)}{loc.is_primary ? " (Primario)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium">Indirizzo di Fatturazione</label>
                  {billingLocations.length === 0 ? (
                    <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-[13px] text-muted-foreground">
                      Nessun indirizzo di fatturazione.
                    </p>
                  ) : (
                    <Controller
                      control={control}
                      name="billing_location_guid"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue placeholder="Nessuna preferenza…" /></SelectTrigger>
                          <SelectContent>
                            {billingLocations.map((loc) => (
                              <SelectItem key={loc.guid} value={loc.location_guid}>
                                {formatAddress(loc)}{loc.is_primary ? " (Primario)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rows */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Righe Ordine</h2>
              <span className="text-[12px] text-muted-foreground">{fields.length} articoli</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Article search */}
            <ArticleInlineSearch ref={searchRef} onSelect={handleAddArticle} />

            {fields.length === 0 ? (
              <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-6 text-center text-[13px] text-muted-foreground">
                Nessun articolo. Usa la barra di ricerca per aggiungere articoli.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={th}>Articolo</TableHead>
                      <TableHead className={`${th} w-20 text-right`}>Qtà</TableHead>
                      <TableHead className={`${th} w-28 text-right`}>Prezzo</TableHead>
                      <TableHead className={`${th} w-16 text-right`}>Sc.%</TableHead>
                      <TableHead className={`${th} w-28 text-right`}>Totale</TableHead>
                      <TableHead className={`${th} w-10`} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const qty = watchedRows?.[index]?.quantity ?? 0;
                      const price = watchedRows?.[index]?.unit_price ?? 0;
                      const disc = watchedRows?.[index]?.discount_percent ?? 0;
                      const lineTotal = qty * price * (1 - disc / 100);

                      return (
                        <TableRow key={field.id}>
                          <TableCell className="px-2 py-2">
                            <div>
                              <p className="text-[12px] font-medium leading-tight">{field.article_description}</p>
                              <p className="text-[11px] text-muted-foreground">{field.article_code}</p>
                            </div>
                          </TableCell>
                          <TableCell className="px-2 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              {...register(`rows.${index}.quantity`, { valueAsNumber: true })}
                              className="h-7 w-full text-right text-[12px]"
                            />
                          </TableCell>
                          <TableCell className="px-2 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...register(`rows.${index}.unit_price`, { valueAsNumber: true })}
                              className="h-7 w-full text-right text-[12px]"
                            />
                          </TableCell>
                          <TableCell className="px-2 py-2">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              {...register(`rows.${index}.discount_percent`, { valueAsNumber: true })}
                              className="h-7 w-full text-right text-[12px]"
                            />
                          </TableCell>
                          <TableCell className="px-2 py-2 text-right text-[12px] font-medium tabular-nums">
                            {fmt(lineTotal)}
                          </TableCell>
                          <TableCell className="px-2 py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {errors.rows?.message && (
              <p className="text-[12px] text-destructive">{errors.rows.message}</p>
            )}

            {/* Totals summary */}
            {fields.length > 0 && (
              <div className="flex justify-end">
                <div className="space-y-1 text-right">
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] text-muted-foreground">Lordo</span>
                    <span className="text-[13px] tabular-nums">{fmt(totals.gross)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex items-center gap-4">
                      <span className="text-[12px] text-muted-foreground">Sconto</span>
                      <span className="text-[13px] tabular-nums text-destructive">-{fmt(totals.discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 border-t border-border/60 pt-1">
                    <span className="text-[12px] font-medium">Netto</span>
                    <span className="text-[14px] font-semibold tabular-nums text-primary">{fmt(totals.net)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Firma operatore */}
        <Controller
          control={control}
          name="warehouse_worker_guid"
          render={({ field }) => (
            <Card className={!field.value ? "border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20" : "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PenLine className={`h-4 w-4 ${!field.value ? "text-amber-500" : "text-emerald-500"}`} />
                  <h3 className="text-[14px] font-semibold">Firma Operatore</h3>
                  {!field.value && (
                    <Badge variant="secondary" className="ml-auto border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950 dark:text-amber-400">
                      Richiesta
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-[13px] text-muted-foreground">
                  Seleziona l'operatore responsabile della modifica.
                </p>
                {isLoadingWorkers ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-[13px] text-muted-foreground">Caricamento operatori…</span>
                  </div>
                ) : (
                  <Select value={field.value} onValueChange={field.onChange}>
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
          )}
        />

        {/* Error banner */}
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
            <p className="text-[13px] text-destructive">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/orders/${order.guid}`)}>
            Annulla
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Salvataggio…
              </>
            ) : (
              "Salva Modifiche"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
