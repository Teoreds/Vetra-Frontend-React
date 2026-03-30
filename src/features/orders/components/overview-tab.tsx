import { Building2, MapPin, Package, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useParty } from "@/features/parties/hooks/use-party";
import { usePartyLocations } from "@/features/parties/hooks/use-party-locations";
import { useArticles } from "@/features/articles/hooks/use-articles";
import { useUnitOfMeasures } from "@/features/articles/hooks/use-article-lookups";
import { usePaymentMethods, usePaymentTerms } from "@/shared/hooks/use-lookups";
import { formatCurrency } from "@/shared/lib/utils";
import type { OrderOut } from "../types/order.types";

interface OverviewTabProps {
  order: OrderOut;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-[13px]">{value || <span className="text-muted-foreground/50">—</span>}</p>
    </div>
  );
}

function fmtAddress(loc: {
  address_line: string | null;
  city: string | null;
  province: string | null;
  post_code: string | null;
}) {
  const parts = [
    loc.address_line,
    [loc.post_code, loc.city].filter(Boolean).join(" "),
    loc.province,
  ].filter(Boolean);
  return parts.join(", ") || null;
}

export function OverviewTab({ order }: OverviewTabProps) {
  const { data: party } = useParty(order.party_guid);
  const { data: locations = [] } = usePartyLocations(order.party_guid);
  const { data: articlesData } = useArticles({ limit: 200 });
  const { data: unitOfMeasures = [] } = useUnitOfMeasures();
  const uomMap = new Map(unitOfMeasures.map((u) => [u.code, u.description]));
  const { map: paymentMethodMap } = usePaymentMethods();
  const { map: paymentTermMap } = usePaymentTerms();

  const articleMap = new Map(
    (articlesData?.items ?? []).map((a) => [a.guid, a]),
  );

  const billingLoc = order.billing_location_guid
    ? locations.find((l) => l.location_guid === order.billing_location_guid)
    : locations.find((l) => l.type_code === "BILLING" && l.is_primary);

  const shippingLoc = order.shipping_location_guid
    ? locations.find((l) => l.location_guid === order.shipping_location_guid)
    : locations.find((l) => l.type_code === "SHIPPING" && l.is_primary);

  const totalGross = Number(order.total_gross ?? 0);
  const totalDiscount = Number(order.total_discount ?? 0);
  const totalVat = Number(order.total_vat ?? 0);
  const totalNet = Number(order.total_net ?? 0);

  const rows = order.rows ?? [];

  const hasPayment = order.payment_method_guid || order.payment_term_guid;

  return (
    <div className="flex gap-5">
      {/* Colonna principale */}
      <div className="min-w-0 flex-1 space-y-5">
        {/* Articoli */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold">Articoli</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {rows.length}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-muted-foreground">
                Nessun articolo in questo ordine.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-7 px-2 text-left text-foreground/60">Articolo</TableHead>
                    <TableHead className="h-7 w-20 px-2 text-right text-foreground/60">Qtà</TableHead>
                    <TableHead className="h-7 w-28 px-2 text-right text-foreground/60">Prezzo</TableHead>
                    <TableHead className="h-7 w-16 px-2 text-right text-foreground/60">Sc.%</TableHead>
                    <TableHead className="h-7 w-28 px-2 text-right text-foreground/60">Totale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const article = articleMap.get(row.article_guid);
                    const qty = parseFloat(row.quantity);
                    const price = parseFloat(row.unit_price);
                    const discount = parseFloat(row.discount_percent);
                    const lineTotal = qty * price * (1 - discount / 100);

                    return (
                      <TableRow key={row.guid}>
                        <TableCell className="px-2 py-2.5">
                          <div>
                            <p className="text-[13px] font-medium leading-tight">
                              {article?.description ?? row.article_guid.slice(0, 8)}
                            </p>
                            {article && (
                              <p className="text-[11px] text-muted-foreground">{article.code}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-2 py-2.5 text-right text-[13px] tabular-nums">
                          {qty}
                          {row.unit_of_measure_code && (
                            <span className="ml-1 text-[10px] text-muted-foreground">
                              {(uomMap.get(row.unit_of_measure_code) ?? row.unit_of_measure_code).toUpperCase()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-2 py-2.5 text-right text-[13px] tabular-nums">
                          {formatCurrency(price)}
                        </TableCell>
                        <TableCell className="px-2 py-2.5 text-right text-[13px] tabular-nums">
                          {discount > 0 ? `${discount}%` : "—"}
                        </TableCell>
                        <TableCell className="px-2 py-2.5 text-right text-[13px] font-medium tabular-nums">
                          {formatCurrency(lineTotal)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Riepilogo finanziario */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">Imponibile</p>
                  <p className="text-sm font-semibold tabular-nums">{formatCurrency(totalNet)}</p>
                </div>
                <div className="h-8 w-px bg-border/60" />
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">Sconto</p>
                  <p className="text-sm font-semibold tabular-nums text-destructive">
                    {totalDiscount > 0 ? `−${formatCurrency(totalDiscount)}` : "—"}
                  </p>
                </div>
                <div className="h-8 w-px bg-border/60" />
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">IVA</p>
                  <p className="text-sm font-semibold tabular-nums">{formatCurrency(totalVat)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium text-muted-foreground">Totale</p>
                <p className="text-lg font-bold tabular-nums text-primary">{formatCurrency(totalGross)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-72 shrink-0 space-y-4">
        {/* Cliente */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold">Cliente</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Ragione Sociale" value={party?.description} />
            {party?.vat_number && <Field label="Partita IVA" value={party.vat_number} />}
          </CardContent>
        </Card>

        {/* Indirizzi */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold">Indirizzi</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Spedizione" value={shippingLoc ? fmtAddress(shippingLoc) : null} />
            <div className="border-t border-border/40 pt-3">
              <Field label="Fatturazione" value={billingLoc ? fmtAddress(billingLoc) : null} />
            </div>
          </CardContent>
        </Card>

        {/* Pagamento */}
        {hasPayment && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[15px] font-semibold">Pagamento</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field
                label="Metodo"
                value={order.payment_method_guid ? paymentMethodMap.get(order.payment_method_guid) : null}
              />
              <Field
                label="Condizioni"
                value={order.payment_term_guid ? paymentTermMap.get(order.payment_term_guid) : null}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
