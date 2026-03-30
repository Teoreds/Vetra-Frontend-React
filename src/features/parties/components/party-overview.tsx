import { Building2, Truck, FileText, CreditCard, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { usePartyTypes, useFiscalAreas, usePartyCategories, usePaymentMethods, usePaymentTerms } from "@/shared/hooks/use-lookups";
import { useParties } from "../hooks/use-parties";
import type { PartyOut } from "../types/party.types";

interface PartyOverviewProps {
  party: PartyOut;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-[13px]">{value || <span className="text-muted-foreground/50">—</span>}</p>
    </div>
  );
}

export function PartyOverview({ party }: PartyOverviewProps) {
  const { map: typeLabels } = usePartyTypes();
  const { map: fiscalAreaLabels } = useFiscalAreas();
  const { map: categoryLabels } = usePartyCategories();
  const { map: paymentMethodLabels } = usePaymentMethods();
  const { map: paymentTermLabels } = usePaymentTerms();
  const { data: carriersData } = useParties({ type_code: "CARRIER", limit: 200 });
  const courierName = party.courier_guid
    ? carriersData?.items?.find((c) => c.guid === party.courier_guid)?.description ?? null
    : null;

  const isCarrier = party.type_code === "CARRIER";
  const hasBankData = party.bank_name || party.bank_iban || party.bank_bic;
  const hasShipping = !isCarrier && (party.courier_guid || (party.shipping_mode && party.shipping_mode !== "FRANCO"));
  const hasPayment = party.default_payment_method_guid || party.default_payment_term_guid;
  const hasCommercial = hasPayment || hasBankData || hasShipping;

  return (
    <div className="space-y-5">
      {/* Identità */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold">Identità</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
            <Field label="Ragione Sociale" value={party.description} />
            <Field label="Partita IVA" value={party.vat_number} />
            <Field label="Tipo" value={typeLabels.get(party.type_code) ?? party.type_code} />
            {party.fiscal_area_code && (
              <Field label="Area Fiscale" value={fiscalAreaLabels.get(party.fiscal_area_code) ?? party.fiscal_area_code} />
            )}
            {party.sdi_code && <Field label="Codice SDI" value={party.sdi_code} />}
            {party.category_code && (
              <Field label="Categoria" value={categoryLabels.get(party.category_code) ?? party.category_code} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Commerciale */}
      {hasCommercial && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold">Commerciale</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasPayment && (
              <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                <Field
                  label="Metodo di Pagamento"
                  value={party.default_payment_method_guid
                    ? paymentMethodLabels.get(party.default_payment_method_guid)
                    : null}
                />
                <Field
                  label="Condizioni di Pagamento"
                  value={party.default_payment_term_guid
                    ? paymentTermLabels.get(party.default_payment_term_guid)
                    : null}
                />
              </div>
            )}

            {hasBankData && (
              <div className={hasPayment ? "border-t border-border/40 pt-3" : ""}>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Banca</span>
                </div>
                <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                  <Field label="Nome" value={party.bank_name} />
                  <Field label="IBAN" value={party.bank_iban} />
                  <Field label="BIC/SWIFT" value={party.bank_bic} />
                </div>
              </div>
            )}

            {hasShipping && (
              <div className={(hasPayment || hasBankData) ? "border-t border-border/40 pt-3" : ""}>
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Spedizione</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6">
                  <Field label="Vettore" value={courierName} />
                  <Field label="Modalità" value={party.shipping_mode === "ASSEGNATO" ? "Assegnato" : "Franco"} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
