import { Building2, MapPin, Plus, Package, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useParties } from "@/features/parties/hooks/use-parties";
import { usePartyLocations } from "@/features/parties/hooks/use-party-locations";
import { useArticles } from "@/features/articles/hooks/use-articles";
import { usePaymentMethods, usePaymentTerms } from "@/shared/hooks/use-lookups";
import type { OrderOut } from "../types/order.types";

interface OverviewTabProps {
  order: OrderOut;
}

function fmt(n: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(n);
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
  return parts.join(", ") || "\u2014";
}

export function OverviewTab({ order }: OverviewTabProps) {
  const { data: partiesData } = useParties({ limit: 200 });
  const party = partiesData?.items.find((p) => p.guid === order.party_guid);
  const { data: locations = [] } = usePartyLocations(order.party_guid);
  const { data: articlesData } = useArticles({ limit: 200 });
  const { map: paymentMethodMap } = usePaymentMethods();
  const { map: paymentTermMap } = usePaymentTerms();

  const articleMap = new Map(
    (articlesData?.items ?? []).map((a) => [a.guid, a]),
  );

  const billingLoc = order.billing_location_guid
    ? locations.find(
        (l) => l.location_guid === order.billing_location_guid,
      )
    : locations.find((l) => l.type_code === "BILLING" && l.is_primary);

  const shippingLoc = order.shipping_location_guid
    ? locations.find(
        (l) => l.location_guid === order.shipping_location_guid,
      )
    : locations.find((l) => l.type_code === "SHIPPING" && l.is_primary);

  const totalGross = Number(order.total_gross ?? 0);
  const totalDiscount = Number(order.total_discount ?? 0);
  const totalVat = Number(order.total_vat ?? 0);
  const totalNet = Number(order.total_net ?? 0);

  const rows = order.rows ?? [];

  return (
    <div className="flex gap-5">
      {/* ── Colonna principale: tabella articoli + totali sotto ── */}
      <div className="min-w-0 flex-1 space-y-5">
        {/* Tabella articoli */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Articoli
              </h3>
              <Badge variant="secondary" className="text-[10px]">
                {rows.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
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
                            <p className="text-[12px] font-medium leading-tight">
                              {article?.description ?? row.article_guid.slice(0, 8)}
                            </p>
                            {article && (
                              <p className="text-[11px] text-muted-foreground">
                                {article.code}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-2 py-2.5 text-right text-[12px] tabular-nums">
                          {qty}
                          {row.unit_of_measure_code && (
                            <span className="ml-1 text-[10px] text-muted-foreground">
                              {row.unit_of_measure_code}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-2 py-2.5 text-right text-[12px] tabular-nums">
                          {fmt(price)}
                        </TableCell>
                        <TableCell className="px-2 py-2.5 text-right text-[12px] tabular-nums">
                          {discount > 0 ? `${discount}%` : "\u2014"}
                        </TableCell>
                        <TableCell className="px-2 py-2.5 text-right text-[12px] font-medium tabular-nums">
                          {fmt(lineTotal)}
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
                  <p className="text-[14px] font-semibold tabular-nums">{fmt(totalNet)}</p>
                </div>
                <div className="h-8 w-px bg-border/60" />
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">Sconto</p>
                  <p className="text-[14px] font-semibold tabular-nums text-destructive">
                    {totalDiscount > 0 ? `\u2212${fmt(totalDiscount)}` : "\u2014"}
                  </p>
                </div>
                <div className="h-8 w-px bg-border/60" />
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">IVA</p>
                  <p className="text-[14px] font-semibold tabular-nums">{fmt(totalVat)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium text-muted-foreground">Totale</p>
                <p className="text-[18px] font-bold tabular-nums text-primary">{fmt(totalGross)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Sidebar destra: cliente + indirizzi + logistica + note ── */}
      <div className="w-72 shrink-0 space-y-4">
        <Card>
          <CardContent className="space-y-4 pt-5">
            {/* Cliente */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Cliente
                </h4>
              </div>
              <div className="space-y-0.5 pl-[22px]">
                <p className="text-[13px] font-medium">
                  {party?.description ?? "\u2014"}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  P.IVA {party?.vat_number ?? "\u2014"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Fatturazione */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Fatturazione
                </h4>
              </div>
              <p className="pl-[22px] text-[13px]">
                {billingLoc ? fmtAddress(billingLoc) : "Non specificato"}
              </p>
            </div>

            <Separator />

            {/* Spedizione */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Spedizione
                </h4>
              </div>
              <p className="pl-[22px] text-[13px]">
                {shippingLoc ? fmtAddress(shippingLoc) : "Non specificato"}
              </p>
            </div>

            <Separator />

            {/* Pagamento */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Pagamento
                </h4>
              </div>
              <dl className="space-y-1 pl-[22px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-[12px] text-muted-foreground">Metodo</dt>
                  <dd className="text-[12px] font-medium text-right">
                    {order.payment_method_guid
                      ? paymentMethodMap.get(order.payment_method_guid) ?? "\u2014"
                      : "Non specificato"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[12px] text-muted-foreground">Condizioni</dt>
                  <dd className="text-[12px] font-medium text-right">
                    {order.payment_term_guid
                      ? paymentTermMap.get(order.payment_term_guid) ?? "\u2014"
                      : "Non specificato"}
                  </dd>
                </div>
              </dl>
            </div>

            <Separator />

            {/* Nota — link discreto */}
            <button
              type="button"
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Aggiungi nota
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
