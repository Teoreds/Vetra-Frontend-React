import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { NewOrderStepper, type StepConfig } from "../components/new-order-stepper";
import { NewOrderStepDetails, type Step1Data } from "../components/new-order-step-details";
import { NewOrderStepItems, type OrderRowDraft } from "../components/new-order-step-items";
import { NewOrderStepReview } from "../components/new-order-step-review";
import { ordersApi } from "../api/orders.api";
import { useOrder } from "../hooks/use-order";
import { useArticles } from "@/features/articles/hooks/use-articles";

const STEPS: StepConfig[] = [
  { label: "Dati Ordine", description: "Cliente e data" },
  { label: "Articoli", description: "Righe e impegni" },
  { label: "Revisione", description: "Conferma finale" },
];

export interface WizardData {
  step1: Step1Data;
  availableRows: OrderRowDraft[];
  commitmentRows: OrderRowDraft[];
}

export function OrderWizardPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const mode = id ? "edit" : "create";

  const { data: order, isLoading: isLoadingOrder } = useOrder(id ?? "");
  const { data: articlesData, isLoading: isLoadingArticles } = useArticles(
    mode === "edit" ? { limit: 200 } : undefined,
  );

  // Build article lookup map for edit mode hydration
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

  // Hydrate rows from order for edit mode
  const hydratedRows = useMemo(() => {
    if (mode !== "edit" || !order?.rows) return { available: [] as OrderRowDraft[], commitment: [] as OrderRowDraft[] };

    const available: OrderRowDraft[] = [];
    const commitment: OrderRowDraft[] = [];

    for (const row of order.rows) {
      const article = articleMap.get(row.article_guid);
      const draft: OrderRowDraft = {
        article_guid: row.article_guid,
        article_code: article?.code ?? row.article_guid.slice(0, 8),
        article_description: article?.description ?? "Articolo sconosciuto",
        unit_of_measure_code: article?.unit_of_measure_code ?? row.unit_of_measure_code ?? undefined,
        quantity: parseFloat(row.quantity),
        unit_price: parseFloat(row.unit_price),
        discount_percent: parseFloat(row.discount_percent),
        vat_code: row.vat_code ?? undefined,
        _serverGuid: row.guid,
      };

      if (row.availability_status_code === "AVAILABLE") {
        available.push(draft);
      } else {
        commitment.push(draft);
      }
    }

    return { available, commitment };
  }, [order, articleMap, mode]);

  // Track original server row guids for soft-delete detection
  const originalRowGuids = useMemo(() => {
    if (mode !== "edit" || !order?.rows) return new Set<string>();
    return new Set(order.rows.map((r) => r.guid));
  }, [order, mode]);

  // Hydrate step1Data from order for edit mode
  const hydratedStep1 = useMemo((): Step1Data | null => {
    if (mode !== "edit" || !order) return null;
    return {
      party_guid: order.party_guid,
      order_date: order.order_date,
      shipping_location_guid: order.shipping_location_guid ?? undefined,
      billing_location_guid: order.billing_location_guid ?? undefined,
    };
  }, [order, mode]);

  const [currentStep, setCurrentStep] = useState(mode === "edit" ? 2 : 1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [orderGuid, setOrderGuid] = useState<string | null>(mode === "edit" ? id ?? null : null);
  const [availableRows, setAvailableRows] = useState<OrderRowDraft[]>([]);
  const [commitmentRows, setCommitmentRows] = useState<OrderRowDraft[]>([]);
  const [vatRate, setVatRate] = useState(order?.vat_rate ? parseFloat(order.vat_rate) : 0.22);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [step1Pending, setStep1Pending] = useState(false);

  // Effective values — prefer user-edited state, fallback to hydrated
  const effectiveStep1 = step1Data ?? hydratedStep1;
  const effectiveAvailable = availableRows.length > 0 ? availableRows : hydratedRows.available;
  const effectiveCommitment = commitmentRows.length > 0 ? commitmentRows : hydratedRows.commitment;
  const effectiveOrderGuid = orderGuid;

  async function handleStep1Next(data: Step1Data) {
    if (mode === "edit" && id) {
      setStep1Data(data);
      setStep1Error(null);

      // Check if addresses changed compared to the original order
      const shippingChanged =
        (data.shipping_location_guid ?? null) !== (order?.shipping_location_guid ?? null);
      const billingChanged =
        (data.billing_location_guid ?? null) !== (order?.billing_location_guid ?? null);

      if (shippingChanged || billingChanged) {
        setStep1Pending(true);
        try {
          const { error } = await ordersApi.update(id, {
            shipping_location_guid: data.shipping_location_guid || null,
            billing_location_guid: data.billing_location_guid || null,
          });
          if (error) {
            setStep1Error("Impossibile aggiornare gli indirizzi. Riprova.");
            setStep1Pending(false);
            return;
          }
        } catch {
          setStep1Error("Errore di rete. Riprova.");
          setStep1Pending(false);
          return;
        } finally {
          setStep1Pending(false);
        }
      }

      setCurrentStep(2);
      return;
    }

    const previousPartyGuid = step1Data?.party_guid;
    const partyChanged = !!previousPartyGuid && previousPartyGuid !== data.party_guid;

    setStep1Data(data);
    setStep1Error(null);

    // Reuse existing draft only if it's the same party
    if (orderGuid && !partyChanged) {
      setCurrentStep(2);
      return;
    }

    // Party changed — reset rows so step 2 starts fresh
    if (partyChanged) {
      setAvailableRows([]);
      setCommitmentRows([]);
    }

    setStep1Pending(true);
    try {
      const { data: newOrder, error } = await ordersApi.create({
        party_guid: data.party_guid,
        order_date: data.order_date,
        payment_method_guid: data.payment_method_guid || null,
        payment_term_guid: data.payment_term_guid || null,
        shipping_location_guid: data.shipping_location_guid || null,
        billing_location_guid: data.billing_location_guid || null,
      });

      if (error || !newOrder) {
        setStep1Error("Impossibile creare la bozza dell'ordine. Riprova.");
        return;
      }

      setOrderGuid(newOrder.guid);
      setCurrentStep(2);
    } catch {
      setStep1Error("Errore di rete. Riprova.");
    } finally {
      setStep1Pending(false);
    }
  }

  function handleStep2Next(data: { availableRows: OrderRowDraft[]; commitmentRows: OrderRowDraft[] }) {
    setAvailableRows(data.availableRows);
    setCommitmentRows(data.commitmentRows);

    if (mode === "edit") {
      // Skip step 3 — navigate back to order detail
      navigate(`/orders/${effectiveOrderGuid}`);
      return;
    }

    setCurrentStep(3);
  }

  function handleBack() {
    setCurrentStep(Math.max(1, currentStep - 1));
  }

  // Loading state for edit mode
  if (mode === "edit" && (isLoadingOrder || isLoadingArticles)) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
      </div>
    );
  }

  const headerTitle =
    mode === "edit"
      ? `Modifica Ordine #${order?.guid.slice(0, 8).toUpperCase() ?? ""}`
      : "Nuovo Ordine";
  const headerDescription =
    mode === "edit"
      ? "Modifica le righe dell'ordine."
      : "Completa i passaggi per creare un nuovo ordine.";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(mode === "edit" ? `/orders/${id}` : "/orders")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{headerTitle}</h1>
          <p className="text-[13px] text-muted-foreground">{headerDescription}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="py-2">
        <NewOrderStepper steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Step content */}
      {currentStep === 1 && (
        <div className="mx-auto max-w-xl">
          <NewOrderStepDetails
            defaultValues={effectiveStep1 ?? undefined}
            onNext={handleStep1Next}
            isPending={step1Pending}
            error={step1Error}
            readOnly={mode === "edit"}
          />
        </div>
      )}

      {currentStep === 2 && effectiveStep1 && effectiveOrderGuid && (
        <NewOrderStepItems
          orderGuid={effectiveOrderGuid}
          vatRate={vatRate}
          onVatRateChange={setVatRate}
          initialAvailableRows={effectiveAvailable}
          initialCommitmentRows={effectiveCommitment}
          onNext={handleStep2Next}
          onBack={handleBack}
          mode={mode}
          originalRowGuids={originalRowGuids}
        />
      )}

      {currentStep === 3 && effectiveStep1 && effectiveOrderGuid && (
        <NewOrderStepReview
          orderGuid={effectiveOrderGuid}
          step1Data={effectiveStep1}
          availableRows={availableRows}
          commitmentRows={commitmentRows}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
