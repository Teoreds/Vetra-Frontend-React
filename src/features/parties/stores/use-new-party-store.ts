import { create } from "zustand";
import type { Step1Data } from "../components/new-party-step-details";
import type { Step2Data } from "../components/new-party-step-extras";

interface NewPartyStore {
  currentStep: number;
  step1Data: Step1Data | null;
  step2Data: Step2Data | null;
  setCurrentStep: (step: number) => void;
  setStep1Data: (data: Step1Data | null) => void;
  setStep2Data: (data: Step2Data | null) => void;
  clear: () => void;
}

export const useNewPartyStore = create<NewPartyStore>((set) => ({
  currentStep: 1,
  step1Data: null,
  step2Data: null,
  setCurrentStep: (step) => set({ currentStep: step }),
  setStep1Data: (data) => set({ step1Data: data }),
  setStep2Data: (data) => set({ step2Data: data }),
  clear: () => set({ currentStep: 1, step1Data: null, step2Data: null }),
}));
