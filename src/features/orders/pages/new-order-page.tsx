import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { NewOrderStepper, type StepConfig } from "../components/new-order-stepper";
import { NewOrderStepDetails, type Step1Data } from "../components/new-order-step-details";
import { NewOrderStepItems, type OrderRowDraft } from "../components/new-order-step-items";
import { NewOrderStepReview } from "../components/new-order-step-review";
import { ordersApi } from "../api/orders.api";

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

export function NewOrderPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [orderGuid, setOrderGuid] = useState<string | null>(null);
  const [availableRows, setAvailableRows] = useState<OrderRowDraft[]>([]);
  const [commitmentRows, setCommitmentRows] = useState<OrderRowDraft[]>([]);
  const [vatRate, setVatRate] = useState(0.22);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [step1Pending, setStep1Pending] = useState(false);

  async function handleStep1Next(data: Step1Data) {
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
      const { data: order, error } = await ordersApi.create({
        party_guid: data.party_guid,
        order_date: data.order_date,
        shipping_location_guid: data.shipping_location_guid || null,
        billing_location_guid: data.billing_location_guid || null,
      });

      if (error || !order) {
        setStep1Error("Impossibile creare la bozza dell'ordine. Riprova.");
        return;
      }

      setOrderGuid(order.guid);
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
    setCurrentStep(3);
  }

  function handleBack() {
    setCurrentStep(Math.max(1, currentStep - 1));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate("/orders")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Nuovo Ordine</h1>
          <p className="text-[13px] text-muted-foreground">
            Completa i passaggi per creare un nuovo ordine.
          </p>
        </div>
      </div>

      {/* Stepper — full width, no card */}
      <div className="py-2">
        <NewOrderStepper steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Step content */}
      {currentStep === 1 && (
        <div className="mx-auto max-w-xl">
          <NewOrderStepDetails
            defaultValues={step1Data ?? undefined}
            onNext={handleStep1Next}
            isPending={step1Pending}
            error={step1Error}
          />
        </div>
      )}

      {currentStep === 2 && step1Data && orderGuid && (
        <div className="mx-auto max-w-4xl">
          <NewOrderStepItems
            orderGuid={orderGuid}
            vatRate={vatRate}
            onVatRateChange={setVatRate}
            initialAvailableRows={availableRows}
            initialCommitmentRows={commitmentRows}
            onNext={handleStep2Next}
            onBack={handleBack}
          />
        </div>
      )}

      {currentStep === 3 && step1Data && orderGuid && (
        <div className="mx-auto max-w-4xl">
          <NewOrderStepReview
            orderGuid={orderGuid}
            step1Data={step1Data}
            availableRows={availableRows}
            commitmentRows={commitmentRows}
            onBack={handleBack}
          />
        </div>
      )}
    </div>
  );
}
