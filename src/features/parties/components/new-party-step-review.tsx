import {
  ArrowLeft,
  Building2,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Package,
  Percent,
  Truck,
  User,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
  usePartyTypes,
  useFiscalAreas,
  usePartyCategories,
  useContactTypes,
  useLocationTypes,
  usePaymentMethods,
  usePaymentTerms,
} from "@/shared/hooks/use-lookups";
import { useParties } from "../hooks/use-parties";
import type {
  PartyIdentityData,
  PartyContactsData,
  PartyCommercialData,
} from "../stores/use-new-party-store";

/* ── Helper ───────────────────────────────────────────── */

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-[13px]">{value || <span className="text-muted-foreground/50">—</span>}</p>
    </div>
  );
}

/* ── Props ────────────────────────────────────────────── */

interface Props {
  identity: PartyIdentityData;
  contacts: PartyContactsData;
  commercial: PartyCommercialData;
  imagePreview: string | null;
  onBack: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error?: string | null;
}

/* ── Component ────────────────────────────────────────── */

export function NewPartyStepReview({
  identity,
  contacts,
  commercial,
  imagePreview,
  onBack,
  onConfirm,
  isPending,
  error,
}: Props) {
  const { map: partyTypeMap } = usePartyTypes();
  const { map: fiscalAreaMap } = useFiscalAreas();
  const { map: categoryMap } = usePartyCategories();
  const { map: contactTypeMap } = useContactTypes();
  const { map: locationTypeMap } = useLocationTypes();
  const { map: paymentMethodMap } = usePaymentMethods();
  const { map: paymentTermMap } = usePaymentTerms();
  const { data: carriersData } = useParties({ type_code: "CARRIER", limit: 200 });
  const carrierMap = new Map((carriersData?.items ?? []).map((c) => [c.guid, c.description]));

  const isCustomer = identity.type_code === "CUSTOMER";
  const isSupplier = identity.type_code === "SUPPLIER";
  const isCarrier = identity.type_code === "CARRIER";

  return (
    <div className="space-y-5">
      {/* ── Identità ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold">Identità</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-5">
            {/* Avatar preview */}
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border/40 bg-muted/50">
              {imagePreview ? (
                <img src={imagePreview} alt="Anteprima" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div className="flex-1 grid grid-cols-3 gap-x-6 gap-y-3">
              <Field label="Ragione Sociale" value={identity.description} />
              <Field label="Partita IVA" value={identity.vat_number} />
              <Field label="Tipo" value={partyTypeMap.get(identity.type_code) ?? identity.type_code} />
              <Field label="Area Fiscale" value={fiscalAreaMap.get(identity.fiscal_area_code)} />
              <Field label="Codice SDI" value={identity.sdi_code} />
              <Field label="Categoria" value={categoryMap.get(identity.category_code)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Contatti ─────────────────────────────────── */}
      {contacts.contacts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold">Contatti</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contacts.contacts.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
                >
                  <span className="text-[13px] font-medium text-muted-foreground w-24 shrink-0">
                    {contactTypeMap.get(c.type_code) ?? c.type_code}
                  </span>
                  <span className="text-[13px] flex-1">{c.content}</span>
                  {c.label && (
                    <span className="text-[11px] text-muted-foreground">{c.label}</span>
                  )}
                  {c.is_primary && (
                    <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Primario
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Indirizzi ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold">Indirizzi</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {contacts.addresses.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5"
              >
                <span className="mt-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                  {locationTypeMap.get(a.type_code) ?? a.type_code}
                </span>
                <div className="flex-1 text-[13px]">
                  <p>{a.address_line}</p>
                  <p className="text-muted-foreground">
                    {[a.post_code, a.city, a.province].filter(Boolean).join(", ")}
                  </p>
                </div>
                {a.is_primary && (
                  <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Primario
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Pagamento + Banca + Spedizione ───────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold">Commerciale</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="Metodo di Pagamento" value={paymentMethodMap.get(commercial.default_payment_method_guid)} />
            <Field label="Condizioni di Pagamento" value={paymentTermMap.get(commercial.default_payment_term_guid)} />
          </div>

          <div className="border-t border-border/40 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Banca</span>
            </div>
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">
              <Field label="Nome" value={commercial.bank_name} />
              <Field label="IBAN" value={commercial.bank_iban} />
              <Field label="BIC/SWIFT" value={commercial.bank_bic} />
            </div>
          </div>

          {!isCarrier && (
            <div className="border-t border-border/40 pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Spedizione</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6">
                <Field label="Vettore" value={carrierMap.get(commercial.courier_guid)} />
                <Field label="Modalità" value={commercial.shipping_mode === "ASSEGNATO" ? "Assegnato" : "Franco"} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Sconti (CUSTOMER) ────────────────────────── */}
      {isCustomer && commercial.discounts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold">Sconti Cliente</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {commercial.discounts.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
                >
                  <span className="text-[13px]">
                    {d.article_type_code || "Tutti i tipi"}
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums">{d.discount_percent}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Articoli Forniti (SUPPLIER) ──────────────── */}
      {isSupplier && commercial.supplier_articles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold">Articoli Forniti</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {commercial.supplier_articles.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
                >
                  <span className="text-[13px] flex-1 truncate">{a.article_guid.slice(0, 8)}</span>
                  {a.supplier_code && (
                    <span className="text-[11px] text-muted-foreground">{a.supplier_code}</span>
                  )}
                  {a.purchase_price && (
                    <span className="text-[13px] font-semibold tabular-nums">{a.purchase_price}</span>
                  )}
                  {a.is_preferred && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                      Preferito
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Footer ───────────────────────────────────── */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-[13px] text-destructive">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Indietro
        </Button>
        <Button onClick={onConfirm} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Creazione…
            </>
          ) : (
            "Crea Anagrafica"
          )}
        </Button>
      </div>
    </div>
  );
}
