import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useBack } from "@/shared/hooks/use-back";
import { Stepper } from "@/shared/ui/stepper";
import { NewPartyStepDetails } from "../components/new-party-step-details";
import { NewPartyStepContacts } from "../components/new-party-step-contacts";
import { NewPartyStepCommercial } from "../components/new-party-step-commercial";
import { NewPartyStepReview } from "../components/new-party-step-review";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";
import { articlesApi } from "@/features/articles/api/articles.api";
import {
  useNewPartyStore,
  type PartyIdentityData,
  type PartyContactsData,
  type PartyCommercialData,
} from "../stores/use-new-party-store";

const STEPS = [
  { label: "Identità", description: "Chi è" },
  { label: "Contatti & Indirizzi", description: "Dove sta" },
  { label: "Commerciale", description: "Come ci lavori" },
  { label: "Riepilogo", description: "Conferma" },
];

export function NewPartyPage() {
  const navigate = useNavigate();
  const back = useBack();
  const queryClient = useQueryClient();
  const store = useNewPartyStore();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image state — held in the page (not store) because File is not serializable
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function handleImageSelect(file: File) {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
  }

  function handleImageClear() {
    setImageFile(null);
    setImagePreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
  }

  /* ── Step handlers ─────────────────────────────────── */

  function handleStep1Next(data: PartyIdentityData) {
    store.setStep1Data(data);
    store.setCurrentStep(2);
    setError(null);
  }

  function handleStep2Next(data: PartyContactsData) {
    store.setStep2Data(data);
    store.setCurrentStep(3);
    setError(null);
  }

  function handleStep2Back(draft: PartyContactsData) {
    store.setStep2Data(draft);
    store.setCurrentStep(1);
  }

  function handleStep3Next(data: PartyCommercialData) {
    store.setStep3Data(data);
    store.setCurrentStep(4);
    setError(null);
  }

  function handleStep3Back(draft: PartyCommercialData) {
    store.setStep3Data(draft);
    store.setCurrentStep(2);
  }

  function handleStep4Back() {
    store.setCurrentStep(3);
  }

  function handleClearAndNavigate() {
    handleImageClear();
    store.clear();
    back("/parties");
  }

  /* ── Submit all ────────────────────────────────────── */

  async function handleConfirm() {
    const s1 = store.step1Data;
    const s2 = store.step2Data;
    const s3 = store.step3Data;
    if (!s1 || !s2 || !s3) return;

    setIsPending(true);
    setError(null);

    try {
      // 1. Create party
      const { data: party, error: partyError } = await partiesApi.create({
        description: s1.description,
        vat_number: s1.vat_number || null,
        type_code: s1.type_code,
        category_code: s1.category_code || null,
        fiscal_area_code: s1.fiscal_area_code || null,
        sdi_code: s1.sdi_code || null,
        bank_name: s3.bank_name || null,
        bank_iban: s3.bank_iban || null,
        bank_bic: s3.bank_bic || null,
        courier_guid: s3.courier_guid || null,
        shipping_mode: s3.shipping_mode || "FRANCO",
        default_payment_method_guid: s3.default_payment_method_guid || null,
        default_payment_term_guid: s3.default_payment_term_guid || null,
      });

      if (partyError || !party) {
        setError("Impossibile creare l'anagrafica. Riprova.");
        return;
      }

      const partyGuid = party.guid;

      // 2. Upload image
      if (imageFile) {
        await partiesApi.uploadImage(partyGuid, imageFile);
      }

      // 3. Create contacts
      for (const c of s2.contacts) {
        await partiesApi.createContact(partyGuid, {
          type_code: c.type_code,
          content: c.content,
          label: c.label || null,
          is_primary: c.is_primary,
        });
      }

      // 4. Create locations then link them
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

      // 5. Create discounts (CUSTOMER)
      if (s1.type_code === "CUSTOMER") {
        const discountResults = await Promise.all(
          s3.discounts
            .filter((d) => d.discount_percent !== "")
            .map((d) =>
              partiesApi.createPartyDiscount({
                party_guid: partyGuid,
                article_type_code: d.article_type_code || null,
                discount_percent: Number(d.discount_percent),
              }),
            ),
        );
        if (discountResults.some((r) => r.error)) {
          setError("Anagrafica creata, ma alcuni sconti non sono stati salvati.");
          return;
        }
      }

      // 6. Create supplier articles (SUPPLIER)
      if (s1.type_code === "SUPPLIER") {
        const supplierResults = await Promise.all(
          s3.supplier_articles
            .filter((a) => a.article_guid !== "")
            .map((a) =>
              articlesApi.addSupplier(a.article_guid, {
                party_guid: partyGuid,
                supplier_code: a.supplier_code || null,
                purchase_price: a.purchase_price ? Number(a.purchase_price) : null,
                is_preferred: a.is_preferred,
              }),
            ),
        );
        if (supplierResults.some((r) => r.error)) {
          setError("Anagrafica creata, ma alcuni articoli fornitore non sono stati salvati.");
          return;
        }
      }

      // 7. Invalidate and navigate
      queryClient.invalidateQueries({ queryKey: partyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partyKeys.locations(partyGuid) });
      handleImageClear();
      store.clear();
      navigate(`/parties/${partyGuid}`);
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setIsPending(false);
    }
  }

  /* ── Render ────────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleClearAndNavigate}
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
        <Stepper steps={STEPS} currentStep={store.currentStep} />
      </div>

      {/* Step 1 — Identity */}
      {store.currentStep === 1 && (
        <div className="mx-auto max-w-xl">
          <NewPartyStepDetails
            defaultValues={store.step1Data ?? undefined}
            onNext={handleStep1Next}
            error={error}
            imagePreview={imagePreview}
            onImageSelect={handleImageSelect}
            onImageClear={handleImageClear}
          />
        </div>
      )}

      {/* Step 2 — Contacts & Addresses */}
      {store.currentStep === 2 && store.step1Data && (
        <NewPartyStepContacts
          typeCode={store.step1Data.type_code}
          defaultValues={store.step2Data ?? undefined}
          onNext={handleStep2Next}
          onBack={handleStep2Back}
          error={error}
        />
      )}

      {/* Step 3 — Commercial */}
      {store.currentStep === 3 && store.step1Data && (
        <div className="mx-auto max-w-2xl">
          <NewPartyStepCommercial
            typeCode={store.step1Data.type_code}
            defaultValues={store.step3Data ?? undefined}
            onNext={handleStep3Next}
            onBack={handleStep3Back}
            error={error}
          />
        </div>
      )}

      {/* Step 4 — Review */}
      {store.currentStep === 4 && store.step1Data && store.step2Data && store.step3Data && (
        <div className="mx-auto max-w-2xl">
          <NewPartyStepReview
            identity={store.step1Data}
            contacts={store.step2Data}
            commercial={store.step3Data}
            imagePreview={imagePreview}
            onBack={handleStep4Back}
            onConfirm={handleConfirm}
            isPending={isPending}
            error={error}
          />
        </div>
      )}
    </div>
  );
}
