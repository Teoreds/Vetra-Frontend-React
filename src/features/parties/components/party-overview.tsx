import { Building2, Truck, FileText, CreditCard } from "lucide-react";
import { usePartyTypes, useFiscalAreas, usePartyCategories, usePaymentMethods, usePaymentTerms } from "@/shared/hooks/use-lookups";
import { useParties } from "../hooks/use-parties";
import type { PartyOut } from "../types/party.types";

interface PartyOverviewProps {
  party: PartyOut;
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[13px] text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-[13px] font-medium text-right">{value || "—"}</dd>
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

  const hasBankData = party.bank_name || party.bank_iban || party.bank_bic;
  const hasShipping = party.courier_guid || (party.shipping_mode && party.shipping_mode !== "FRANCO");
  const hasPayment = party.default_payment_method_guid || party.default_payment_term_guid;
  const hasFiscal = party.fiscal_area_code || party.sdi_code || party.category_code;

  return (
    <div className="space-y-5">
      {/* Dati Anagrafici */}
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Dati Anagrafici
        </h3>
        <dl className="space-y-2.5">
          <Field label="Nome" value={party.description} />
          <Field label="Tipo" value={typeLabels.get(party.type_code) ?? party.type_code} />
          <Field label="Partita IVA" value={party.vat_number} />
        </dl>
      </div>

      {/* Dati Bancari */}
      {hasBankData && (
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <h3 className="mb-3.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            Dati Bancari
          </h3>
          <dl className="space-y-2.5">
            <Field label="Banca" value={party.bank_name} />
            <Field label="IBAN" value={party.bank_iban} />
            <Field label="BIC/SWIFT" value={party.bank_bic} />
          </dl>
        </div>
      )}

      {/* Spedizione */}
      {hasShipping && (
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <h3 className="mb-3.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Truck className="h-3.5 w-3.5" />
            Spedizione
          </h3>
          <dl className="space-y-2.5">
            <Field label="Vettore" value={courierName} />
            <Field label="Modalità" value={party.shipping_mode === "ASSEGNATO" ? "Assegnato" : "Franco"} />
          </dl>
        </div>
      )}

      {/* Pagamento */}
      {hasPayment && (
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <h3 className="mb-3.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" />
            Pagamento
          </h3>
          <dl className="space-y-2.5">
            {party.default_payment_method_guid && (
              <Field
                label="Metodo"
                value={paymentMethodLabels.get(party.default_payment_method_guid) ?? party.default_payment_method_guid}
              />
            )}
            {party.default_payment_term_guid && (
              <Field
                label="Condizioni"
                value={paymentTermLabels.get(party.default_payment_term_guid) ?? party.default_payment_term_guid}
              />
            )}
          </dl>
        </div>
      )}

      {/* Dati Fiscali & Classificazione */}
      {hasFiscal && (
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <h3 className="mb-3.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Dati Fiscali
          </h3>
          <dl className="space-y-2.5">
            {party.fiscal_area_code && (
              <Field label="Area Fiscale" value={fiscalAreaLabels.get(party.fiscal_area_code) ?? party.fiscal_area_code} />
            )}
            {party.sdi_code && <Field label="Codice SDI" value={party.sdi_code} />}
            {party.category_code && (
              <Field label="Categoria" value={categoryLabels.get(party.category_code) ?? party.category_code} />
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
