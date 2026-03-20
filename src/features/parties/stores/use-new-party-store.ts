import { create } from "zustand";

/* ── Step data types ─────────────────────────────────── */

export interface PartyIdentityData {
  description: string;
  vat_number: string;
  type_code: string;
  category_code: string;
  fiscal_area_code: string;
  sdi_code: string;
}

export interface ContactDraft {
  type_code: string;
  content: string;
  label: string;
  is_primary: boolean;
}

export interface AddressDraft {
  address_line: string;
  city: string;
  province: string;
  post_code: string;
  type_code: string;
  is_primary: boolean;
}

export interface PartyContactsData {
  contacts: ContactDraft[];
  addresses: AddressDraft[];
}

export interface DiscountDraft {
  article_type_code: string;
  discount_percent: string;
}

export interface SupplierArticleDraft {
  article_guid: string;
  supplier_code: string;
  purchase_price: string;
  is_preferred: boolean;
}

export interface PartyCommercialData {
  default_payment_method_guid: string;
  default_payment_term_guid: string;
  bank_name: string;
  bank_iban: string;
  bank_bic: string;
  courier_guid: string;
  shipping_mode: string;
  discounts: DiscountDraft[];
  supplier_articles: SupplierArticleDraft[];
}

/* ── Store ────────────────────────────────────────────── */

interface NewPartyStore {
  currentStep: number;
  step1Data: PartyIdentityData | null;
  step2Data: PartyContactsData | null;
  step3Data: PartyCommercialData | null;
  setCurrentStep: (step: number) => void;
  setStep1Data: (data: PartyIdentityData | null) => void;
  setStep2Data: (data: PartyContactsData | null) => void;
  setStep3Data: (data: PartyCommercialData | null) => void;
  clear: () => void;
}

export const useNewPartyStore = create<NewPartyStore>((set) => ({
  currentStep: 1,
  step1Data: null,
  step2Data: null,
  step3Data: null,
  setCurrentStep: (step) => set({ currentStep: step }),
  setStep1Data: (data) => set({ step1Data: data }),
  setStep2Data: (data) => set({ step2Data: data }),
  setStep3Data: (data) => set({ step3Data: data }),
  clear: () => set({ currentStep: 1, step1Data: null, step2Data: null, step3Data: null }),
}));
