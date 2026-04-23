import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowRight, MapPin, CreditCard, CalendarClock } from "lucide-react";
import { useForm, Controller, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Button } from "@/shared/ui/button";
import { BackButton } from "@/shared/ui/back-button";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { DatePicker } from "@/shared/ui/date-picker";
import { Stepper } from "@/shared/ui/stepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { PartySearchSelect } from "@/features/parties/components/party-search-select";
import {
  usePartyLocations,
  type PartyLocationWithAddress,
} from "@/features/parties/hooks/use-party-locations";
import { usePaymentMethods, usePaymentTerms } from "@/shared/hooks/use-lookups";
import { useQuote } from "../hooks/use-quote";
import { useArticles } from "@/features/articles/hooks/use-articles";
import { quotesApi } from "../api/quotes.api";
import { quoteKeys } from "../api/quotes.queries";
import { useQueryClient } from "@tanstack/react-query";
import { NewQuoteStepItems, type QuoteRowDraft } from "../components/new-quote-step-items";

// ─── Step 1 schema ────────────────────────────────────────────────────────────

const step1Schema = z.object({
  party_guid: z.uuid("Seleziona un cliente valido"),
  quote_date: z.string({ error: "La data è obbligatoria" }).min(1, "La data è obbligatoria"),
  valid_until: z.string().optional(),
  payment_method_guid: z.string().optional(),
  payment_term_guid: z.string().optional(),
  shipping_location_guid: z.string().optional(),
  billing_location_guid: z.string().optional(),
  note: z.string().optional(),
});

type Step1Values = z.infer<typeof step1Schema>;

const STEPS = [
  { label: "Dati Preventivo", description: "Cliente e date" },
  { label: "Articoli", description: "Righe e prezzi" },
];

function formatAddress(loc: PartyLocationWithAddress): string {
  const parts = [loc.address_line, loc.city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : loc.type_code;
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

export function QuoteWizardPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const mode = id ? "edit" : "create";

  const { data: quote, isLoading } = useQuote(id ?? "");
  const { data: paymentMethods } = usePaymentMethods();
  const { data: paymentTerms } = usePaymentTerms();
  const { data: articlesData, isLoading: isLoadingArticles } = useArticles(
    mode === "edit" ? { limit: 200 } : undefined,
  );

  // Article lookup map for row hydration in edit mode
  const articleMap = useMemo(() => {
    const map = new Map<string, { code: string; description: string; unit_of_measure_code?: string }>();
    if (articlesData?.items) {
      for (const a of articlesData.items) {
        map.set(a.guid, {
          code: a.code,
          description: a.description,
          unit_of_measure_code: a.unit_of_measure_code ?? undefined,
        });
      }
    }
    return map;
  }, [articlesData]);

  const [currentStep, setCurrentStep] = useState(1);
  const [quoteGuid, setQuoteGuid] = useState<string | null>(
    mode === "edit" ? (id ?? null) : null,
  );
  const [step1Pending, setStep1Pending] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const { handleSubmit, control, reset, formState: { errors } } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema) as unknown as Resolver<Step1Values>,
    defaultValues: { quote_date: today },
  });

  // Populate form when quote loads in edit mode
  useEffect(() => {
    if (mode === "edit" && quote) {
      reset({
        party_guid: quote.party_guid,
        quote_date: quote.quote_date,
        valid_until: quote.valid_until ?? undefined,
        payment_method_guid: quote.payment_method_guid ?? undefined,
        payment_term_guid: quote.payment_term_guid ?? undefined,
        shipping_location_guid: quote.shipping_location_guid ?? undefined,
        billing_location_guid: quote.billing_location_guid ?? undefined,
        note: quote.note ?? undefined,
      });
    }
  }, [mode, quote, reset]);

  const selectedPartyGuid = useWatch({ control, name: "party_guid" });
  const { data: locations = [], isLoading: isLoadingLocations } =
    usePartyLocations(selectedPartyGuid || undefined);

  const shippingLocations = locations.filter((l) => l.type_code === "SHIPPING");
  const billingLocations = locations.filter((l) => l.type_code === "BILLING");

  // Righe esistenti in edit mode (hydrated with article data)
  const initialRows = useMemo((): QuoteRowDraft[] => {
    if (mode !== "edit" || !quote?.rows) return [];
    return quote.rows.map((r) => {
      const article = articleMap.get(r.article_guid);
      return {
        article_guid: r.article_guid,
        article_code: article?.code ?? r.article_guid.slice(0, 8),
        article_description: article?.description ?? "Articolo sconosciuto",
        unit_of_measure_code: article?.unit_of_measure_code ?? r.unit_of_measure_code ?? undefined,
        quantity: parseFloat(r.quantity),
        unit_price: parseFloat(r.unit_price),
        discount_percent: parseFloat(r.discount_percent),
        vat_code: r.vat_code ?? undefined,
        _serverGuid: r.guid,
      };
    });
  }, [quote, mode, articleMap]);

  const originalRowGuids = useMemo(
    () => new Set((quote?.rows ?? []).map((r) => r.guid)),
    [quote],
  );

  async function handleStep1Next(values: Step1Values) {
    setStep1Pending(true);
    setStep1Error(null);

    try {
      if (mode === "edit" && id) {
        const { error } = await quotesApi.update(id, {
          valid_until: values.valid_until || null,
          payment_method_guid: values.payment_method_guid || null,
          payment_term_guid: values.payment_term_guid || null,
          shipping_location_guid: values.shipping_location_guid || null,
          billing_location_guid: values.billing_location_guid || null,
          note: values.note || null,
        });
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: quoteKeys.detail(id) });
        setCurrentStep(2);
      } else {
        const { data: created, error } = await quotesApi.create({
          party_guid: values.party_guid,
          quote_date: values.quote_date,
          valid_until: values.valid_until || null,
          payment_method_guid: values.payment_method_guid || null,
          payment_term_guid: values.payment_term_guid || null,
          shipping_location_guid: values.shipping_location_guid || null,
          billing_location_guid: values.billing_location_guid || null,
          note: values.note || null,
        });
        if (error || !created) throw error ?? new Error("Creazione fallita");
        queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
        setQuoteGuid(created.guid);
        setCurrentStep(2);
      }
    } catch {
      setStep1Error("Impossibile salvare i dati. Riprova.");
    } finally {
      setStep1Pending(false);
    }
  }

  function handleStep2Complete() {
    const guid = quoteGuid ?? id;
    if (!guid) return;
    queryClient.invalidateQueries({ queryKey: quoteKeys.detail(guid) });
    navigate(`/quotes/${guid}`);
    // Auto-download PDF in background
    quotesApi.downloadPdf(guid).catch(() => {});
  }

  if (mode === "edit" && (isLoading || isLoadingArticles)) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={mode === "edit" ? "Modifica Preventivo" : "Nuovo Preventivo"}
        description={
          mode === "edit"
            ? `#${quote?.code?.replace(/^QUO-/i, "") ?? ""}`
            : "Completa i passaggi per creare un nuovo preventivo."
        }
        leading={<BackButton fallback={mode === "edit" ? `/quotes/${id}` : "/quotes"} />}
      />

      {/* Stepper */}
      <div className="py-2">
        <Stepper steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Step 1 — Dati Preventivo */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmit(handleStep1Next)} className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-[15px] font-semibold">Dati Preventivo</h2>
              <p className="text-[13px] text-muted-foreground">
                Seleziona il cliente, la data e i dettagli del preventivo.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Cliente + Data */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium">Cliente</label>
                  <Controller
                    control={control}
                    name="party_guid"
                    render={({ field }) => (
                      <PartySearchSelect
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={mode === "edit"}
                        typeCode="CUSTOMER"
                      />
                    )}
                  />
                  {errors.party_guid && (
                    <p className="text-[11px] text-destructive">
                      {errors.party_guid.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium">Data Preventivo</label>
                  <Controller
                    control={control}
                    name="quote_date"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Seleziona una data…"
                      />
                    )}
                  />
                  {errors.quote_date && (
                    <p className="text-[11px] text-destructive">
                      {errors.quote_date.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Valido fino + Note */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium">
                    Valido fino al{" "}
                    <span className="font-normal text-muted-foreground">
                      (opzionale)
                    </span>
                  </label>
                  <Controller
                    control={control}
                    name="valid_until"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="Nessuna scadenza…"
                      />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium">
                    Note{" "}
                    <span className="font-normal text-muted-foreground">
                      (opzionale)
                    </span>
                  </label>
                  <Controller
                    control={control}
                    name="note"
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={2}
                        placeholder="Note per il cliente…"
                        className="flex w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20 resize-none"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Pagamento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    Metodo di Pagamento
                  </label>
                  <Controller
                    control={control}
                    name="payment_method_guid"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona metodo…" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((pm) => (
                            <SelectItem key={pm.guid} value={pm.guid}>
                              {pm.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium">
                    <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                    Condizioni di Pagamento
                  </label>
                  <Controller
                    control={control}
                    name="payment_term_guid"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona condizioni…" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentTerms.map((pt) => (
                            <SelectItem key={pt.guid} value={pt.guid}>
                              {pt.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Indirizzi */}
              {selectedPartyGuid && (
                <div className="grid grid-cols-2 gap-4">
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
                      <Controller
                        control={control}
                        name="shipping_location_guid"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            disabled={isLoadingLocations}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Nessuna preferenza…" />
                            </SelectTrigger>
                            <SelectContent>
                              {shippingLocations.map((loc) => (
                                <SelectItem
                                  key={loc.guid}
                                  value={loc.location_guid}
                                >
                                  {formatAddress(loc)}
                                  {loc.is_primary && (
                                    <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-foreground/25 align-middle" />
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                  </div>
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
                      <Controller
                        control={control}
                        name="billing_location_guid"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            disabled={isLoadingLocations}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Nessuna preferenza…" />
                            </SelectTrigger>
                            <SelectContent>
                              {billingLocations.map((loc) => (
                                <SelectItem
                                  key={loc.guid}
                                  value={loc.location_guid}
                                >
                                  {formatAddress(loc)}
                                  {loc.is_primary && (
                                    <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-foreground/25 align-middle" />
                                  )}
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

          {step1Error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <p className="text-[13px] text-destructive">{step1Error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={step1Pending}>
              {step1Pending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Salvataggio…
                </>
              ) : (
                <>
                  Avanti
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Step 2 — Articoli */}
      {currentStep === 2 && (quoteGuid ?? id) && (
        <NewQuoteStepItems
          quoteGuid={(quoteGuid ?? id)!}
          initialRows={initialRows}
          initialVatRate={quote?.vat_rate ? parseFloat(quote.vat_rate) : 0.22}
          onNext={handleStep2Complete}
          onBack={() => setCurrentStep(1)}
          mode={mode}
          originalRowGuids={originalRowGuids}
        />
      )}
    </div>
  );
}
