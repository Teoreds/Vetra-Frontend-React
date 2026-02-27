import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { NewOrderStepper, type StepConfig } from "@/features/orders/components/new-order-stepper";
import { NewPartyStepDetails, type Step1Data } from "../components/new-party-step-details";
import {
  NewPartyStepExtras,
  type Step2Data,
} from "../components/new-party-step-extras";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";
import { articlesApi } from "@/features/articles/api/articles.api";

const STEPS: StepConfig[] = [
  { label: "Dati Anagrafica", description: "Info generali" },
  { label: "Dettagli", description: "Contatti, indirizzi e altro" },
];

export function NewPartyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleStep1Next(data: Step1Data) {
    setStep1Data(data);
    setError(null);
    setCurrentStep(2);
  }

  async function handleStep2Submit(data: Step2Data) {
    if (!step1Data) return;
    setStep2Data(data);
    setError(null);
    await submitAll(step1Data, data);
  }

  async function submitAll(s1: Step1Data, s2: Step2Data) {
    setIsPending(true);
    setError(null);

    try {
      // 1. Create the party
      const { data: party, error: partyError } = await partiesApi.create({
        description: s1.description,
        vat_number: s1.vat_number || null,
        type_code: s1.type_code,
      });

      if (partyError || !party) {
        setError("Impossibile creare l'anagrafica. Riprova.");
        return;
      }

      const partyGuid = party.guid;

      // 2. Create contacts
      for (const c of s2.contacts) {
        await partiesApi.createContact(partyGuid, {
          type_code: c.type_code,
          content: c.content,
          label: c.label || null,
          is_primary: c.is_primary,
        });
      }

      // 3. Create locations then link them
      for (const addr of s2.addresses) {
        const { data: loc, error: locError } = await partiesApi.createLocation({
          address_line: addr.address_line || null,
          city: addr.city || null,
          province: addr.province || null,
          post_code: addr.post_code || null,
        });

        if (locError || !loc) continue;

        await partiesApi.createPartyLocation(partyGuid, {
          location_guid: loc.guid,
          type_code: addr.type_code,
          is_primary: addr.is_primary,
        });
      }

      // 4. Create discounts (CUSTOMER)
      if (s1.type_code === "CUSTOMER") {
        await Promise.all(
          s2.discounts
            .filter((d) => d.discount_percent !== "")
            .map((d) =>
              partiesApi.createPartyDiscount({
                party_guid: partyGuid,
                article_type_code: d.article_type_code || null,
                discount_percent: Number(d.discount_percent),
              }),
            ),
        );
      }

      // 5. Create supplier articles (SUPPLIER)
      if (s1.type_code === "SUPPLIER") {
        await Promise.all(
          s2.supplier_articles
            .filter((a) => a.article_guid !== "")
            .map((a) =>
              articlesApi.addSupplier(a.article_guid, {
                party_guid: partyGuid,
                supplier_code: a.supplier_code || null,
                list_price: a.list_price ? Number(a.list_price) : null,
                is_preferred: a.is_preferred,
              }),
            ),
        );
      }

      // 6. Invalidate and navigate
      queryClient.invalidateQueries({ queryKey: partyKeys.lists() });
      navigate(`/parties/${partyGuid}`);
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate("/parties")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Nuova Anagrafica</h1>
          <p className="text-[13px] text-muted-foreground">
            Completa i passaggi per creare una nuova anagrafica.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="py-2">
        <NewOrderStepper steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Step 1 — Identity */}
      {currentStep === 1 && (
        <div className="mx-auto max-w-xl">
          <NewPartyStepDetails
            defaultValues={step1Data ?? undefined}
            onNext={handleStep1Next}
            error={error}
          />
        </div>
      )}

      {/* Step 2 — Contacts, addresses, type-specific extras */}
      {currentStep === 2 && step1Data && (
        <div className="mx-auto max-w-3xl">
          <NewPartyStepExtras
            typeCode={step1Data.type_code}
            defaultValues={step2Data ?? undefined}
            onSubmit={handleStep2Submit}
            onBack={() => setCurrentStep(1)}
            isPending={isPending}
            error={error}
          />
        </div>
      )}
    </div>
  );
}
