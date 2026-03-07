import { Stepper, type StepItem } from "@/shared/ui/stepper";

export type StepConfig = StepItem;

interface NewOrderStepperProps {
  steps: StepConfig[];
  currentStep: number;
}

export function NewOrderStepper({ steps, currentStep }: NewOrderStepperProps) {
  return <Stepper steps={steps} currentStep={currentStep} />;
}
