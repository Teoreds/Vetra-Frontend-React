import {
  Building2,
  MapPin,
  Truck,
  StickyNote,
  DollarSign,
  PercentCircle,
  Receipt,
  Calculator,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { formatDate } from "@/shared/lib/utils";
import { useParties } from "@/features/parties/hooks/use-parties";
import { usePartyLocations } from "@/features/parties/hooks/use-party-locations";
import { getStatusLabel } from "../types/order-status";
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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-right text-[13px] font-medium">
        {value || "\u2014"}
      </span>
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
  return parts.join(", ") || "\u2014";
}

export function OverviewTab({ order }: OverviewTabProps) {
  const { data: partiesData } = useParties({ limit: 200 });
  const party = partiesData?.items.find((p) => p.guid === order.party_guid);
  const { data: locations = [] } = usePartyLocations(order.party_guid);

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
  const totalNet = Number(order.total_net ?? 0);
  const totalVat = Number(order.total_vat ?? 0);
  const grandTotal = totalNet + totalVat;

  return (
    <div className="space-y-6">
      {/* ── Griglia informativa a 2 colonne ── */}
      <div className="grid grid-cols-2 gap-5">
        {/* Colonna sinistra: Cliente, Fatturazione, Spedizione */}
        <Card>
          <CardContent className="space-y-5 pt-6">
            {/* Cliente */}
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
          </CardContent>
        </Card>

        {/* Colonna destra: Logistica e Metadati */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Logistica e Metadati
              </h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <InfoRow
              label="Data Ordine"
              value={formatDate(order.order_date)}
            />
            <InfoRow
              label="Stato"
              value={getStatusLabel(order.status_code)}
            />

            <Separator />

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <StickyNote className="h-3 w-3 text-muted-foreground" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Note Interne
                </p>
              </div>
              <p className="text-[13px] italic text-muted-foreground">
                Nessuna nota interna.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Riepilogo finanziario — 4 card ── */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <DollarSign className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Imponibile
              </p>
              <p className="text-[16px] font-bold">{fmt(totalGross)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40">
              <PercentCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sconto
              </p>
              <p className="text-[16px] font-bold">
                {totalDiscount > 0 ? `\u2212${fmt(totalDiscount)}` : fmt(0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
              <Receipt className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                IVA
              </p>
              <p className="text-[16px] font-bold">{fmt(totalVat)}</p>
            </div>
          </div>
        </Card>

        <Card className="border-primary/20 bg-primary/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
                Totale
              </p>
              <p className="text-[22px] font-extrabold tracking-tight text-primary">
                {fmt(grandTotal)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
