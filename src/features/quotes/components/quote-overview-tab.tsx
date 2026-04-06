import { Fragment } from "react";
import { MapPin, Package, CreditCard, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { PartyAvatar } from "@/features/parties/components/party-avatar";
import { AddressBox } from "@/shared/ui/address-box";
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
import { usePaymentMethods, usePaymentTerms } from "@/shared/hooks/use-lookups";
import { formatCurrency } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";
import { QUOTE_STATUSES, QUOTE_STATUS_LABELS } from "../types/quote-status";
import type { QuoteDetailOut } from "../types/quote.types";

const PIPELINE = QUOTE_STATUSES.filter((s) => s !== "REJECTED");
type PipelineCode = (typeof PIPELINE)[number];
const STEP_INDEX: Record<string, number> = Object.fromEntries(
  PIPELINE.map((s, i) => [s, i]),
);

function StatusPipelineCard({ statusCode }: { statusCode: string }) {
  const upper = statusCode.toUpperCase();
  const currentIndex = STEP_INDEX[upper] ?? -1;
  const isRejected = upper === "REJECTED";

  return (
    <Card>
      <CardContent className="py-4">
        <ol className="flex items-center">
          {PIPELINE.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            const isLast = index === PIPELINE.length - 1;

            return (
              <Fragment key={step}>
                <li className="flex shrink-0 flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all",
                      isCompleted && "bg-primary/15 text-primary",
                      isActive && !isRejected && "bg-primary text-primary-foreground shadow-sm",
                      !isCompleted && !isActive && "bg-muted text-muted-foreground/50",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium whitespace-nowrap",
                      isActive && !isRejected && "text-primary font-semibold",
                      isCompleted && "text-primary/70",
                      !isCompleted && !isActive && "text-muted-foreground/40",
                    )}
                  >
                    {QUOTE_STATUS_LABELS[step as PipelineCode]}
                  </span>
                </li>
                {!isLast && (
                  <div
                    className={cn(
                      "mb-5 h-px flex-1 mx-2 transition-colors",
                      index < currentIndex ? "bg-primary/25" : "bg-border",
                    )}
                  />
                )}
              </Fragment>
            );
          })}
        </ol>
        {isRejected && (
          <p className="mt-2 text-center text-[12px] font-medium text-destructive">
            Preventivo rifiutato
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-[13px]">
        {value || <span className="text-muted-foreground/50">—</span>}
      </p>
    </div>
  );
}

interface QuoteOverviewTabProps {
  quote: QuoteDetailOut;
}

export function QuoteOverviewTab({ quote }: QuoteOverviewTabProps) {
  const navigate = useNavigate();
  const { data: party } = useParty(quote.party_guid);
  const { data: locations = [] } = usePartyLocations(quote.party_guid);
  const { map: paymentMethodMap } = usePaymentMethods();
  const { map: paymentTermMap } = usePaymentTerms();

  const billingLoc = quote.billing_location_guid
    ? locations.find((l) => l.location_guid === quote.billing_location_guid)
    : locations.find((l) => l.type_code === "BILLING" && l.is_primary);

  const shippingLoc = quote.shipping_location_guid
    ? locations.find((l) => l.location_guid === quote.shipping_location_guid)
    : locations.find((l) => l.type_code === "SHIPPING" && l.is_primary);

  const totalNet = Number(quote.total_net ?? 0);
  const totalDiscount = Number(quote.total_discount ?? 0);
  const totalVat = Number(quote.total_vat ?? 0);
  const totalGross = Number(quote.total_gross ?? 0);

  const rows = quote.rows ?? [];
  const hasPayment = quote.payment_method_guid || quote.payment_term_guid;

  return (
    <div className="space-y-5">
      <StatusPipelineCard statusCode={quote.status_code} />

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
                  Nessun articolo in questo preventivo.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-7 px-2 text-left text-foreground/60">
                        Articolo
                      </TableHead>
                      <TableHead className="h-7 w-20 px-2 text-right text-foreground/60">
                        Qtà
                      </TableHead>
                      <TableHead className="h-7 w-28 px-2 text-right text-foreground/60">
                        Prezzo
                      </TableHead>
                      <TableHead className="h-7 w-16 px-2 text-right text-foreground/60">
                        Sc.%
                      </TableHead>
                      <TableHead className="h-7 w-28 px-2 text-right text-foreground/60">
                        Totale
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => {
                      const qty = parseFloat(row.quantity);
                      const price = parseFloat(row.unit_price);
                      const discount = parseFloat(row.discount_percent);
                      const lineTotal = qty * price * (1 - discount / 100);

                      return (
                        <TableRow key={row.guid}>
                          <TableCell className="px-2 py-2.5">
                            <span className="font-mono text-[12px] text-muted-foreground">
                              #{row.article_guid.slice(0, 8).toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="px-2 py-2.5 text-right text-[13px] tabular-nums">
                            {qty}
                            {row.unit_of_measure_code && (
                              <span className="ml-1 text-[10px] text-muted-foreground">
                                {row.unit_of_measure_code.toUpperCase()}
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
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Imponibile
                    </p>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(totalNet)}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-border/60" />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Sconto
                    </p>
                    <p className="text-sm font-semibold tabular-nums text-destructive">
                      {totalDiscount > 0
                        ? `−${formatCurrency(totalDiscount)}`
                        : "—"}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-border/60" />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      IVA
                    </p>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(totalVat)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Totale
                  </p>
                  <p className="text-lg font-bold tabular-nums text-primary">
                    {formatCurrency(totalGross)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Cliente */}
          <Card>
            <CardContent className="pb-4 pt-5">
              <div className="flex flex-col items-center gap-3 text-center">
                <PartyAvatar
                  partyGuid={quote.party_guid}
                  name={party?.description ?? "?"}
                  imagePath={party?.image_path}
                  className="h-14 w-14 text-[20px]"
                />
                <div className="space-y-0.5">
                  <p className="text-[14px] font-semibold leading-tight">
                    {party?.description ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </p>
                  {party?.vat_number && (
                    <p className="text-[12px] text-muted-foreground">
                      P.IVA {party.vat_number}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/parties/${quote.party_guid}`)}
                  className="text-[12px] text-primary/60 transition-colors hover:text-primary"
                >
                  Apri anagrafica →
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          {quote.notes && (
            <Card>
              <CardHeader>
                <h2 className="text-[15px] font-semibold">Note</h2>
              </CardHeader>
              <CardContent>
                <p className="text-[13px] text-muted-foreground whitespace-pre-wrap">
                  {quote.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Indirizzi */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[15px] font-semibold">Indirizzi</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressBox
                label="Spedizione"
                typeCode="SHIPPING"
                addressLine={shippingLoc?.address_line}
                secondaryLine={
                  [shippingLoc?.post_code, shippingLoc?.city, shippingLoc?.province]
                    .filter(Boolean)
                    .join(", ") || null
                }
                onEdit={() => navigate(`/quotes/${quote.guid}/edit`)}
              />
              <AddressBox
                label="Fatturazione"
                typeCode="BILLING"
                addressLine={billingLoc?.address_line}
                secondaryLine={
                  [billingLoc?.post_code, billingLoc?.city, billingLoc?.province]
                    .filter(Boolean)
                    .join(", ") || null
                }
                onEdit={() => navigate(`/quotes/${quote.guid}/edit`)}
              />
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
              <CardContent className="space-y-4">
                <Field
                  label="Metodo"
                  value={
                    quote.payment_method_guid
                      ? paymentMethodMap.get(quote.payment_method_guid)
                      : null
                  }
                />
                <Field
                  label="Condizioni"
                  value={
                    quote.payment_term_guid
                      ? paymentTermMap.get(quote.payment_term_guid)
                      : null
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
