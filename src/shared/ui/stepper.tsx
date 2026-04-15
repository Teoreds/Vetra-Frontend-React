import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface StepItem {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 1-based
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Avanzamento">
      <ol className={cn("mx-auto flex w-fit items-center gap-0", className)}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200",
                    isCompleted && "bg-primary/15 text-primary",
                    isActive && "bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/15",
                    !isCompleted && !isActive && "bg-muted border border-border text-muted-foreground/50",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  ) : (
                    <span className="text-[10px] font-bold">{stepNumber}</span>
                  )}
                </div>
                <div>
                  <span
                    className={cn(
                      "text-[12px] font-semibold whitespace-nowrap",
                      isActive && "text-primary",
                      isCompleted && "text-primary/70",
                      !isCompleted && !isActive && "text-muted-foreground/50",
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <p
                      className={cn(
                        "text-[10px] leading-none mt-0.5 whitespace-nowrap",
                        isActive && "text-primary/60",
                        !isActive && "text-muted-foreground/40",
                      )}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "mx-4 h-0.5 w-12 shrink-0 rounded-full transition-colors duration-300",
                    stepNumber < currentStep ? "bg-primary/30" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
