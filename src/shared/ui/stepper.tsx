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
      <ol className={cn("mx-auto flex w-fit items-center", className)}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.label} className="flex items-center">
              {/* Cerchio + label */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-[12px] font-semibold transition-all duration-200",
                    isCompleted &&
                      "border-primary/50 bg-primary/15 text-primary shadow-[0_0_0_3px_rgba(37,99,235,0.08)]",
                    isActive &&
                      "border-primary bg-primary text-primary-foreground shadow-[0_0_0_3px_rgba(37,99,235,0.15)]",
                    !isCompleted &&
                      !isActive &&
                      "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-[11px] font-semibold leading-tight whitespace-nowrap",
                      isActive && "text-primary",
                      isCompleted && "text-primary/70",
                      !isCompleted && !isActive && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connettore sfumato */}
              {!isLast && (
                <div
                  className="mx-3 h-px w-28 shrink-0 self-start mt-4 transition-colors duration-300"
                  style={{
                    background:
                      stepNumber < currentStep
                        ? "linear-gradient(to right, transparent, rgba(37,99,235,0.25), transparent)"
                        : "linear-gradient(to right, transparent, rgba(226,232,240,0.8), transparent)",
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
