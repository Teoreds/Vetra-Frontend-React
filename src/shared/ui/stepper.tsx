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
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-200",
                    isCompleted &&
                      "bg-primary/15 text-primary",
                    isActive &&
                      "bg-primary text-primary-foreground",
                    !isCompleted &&
                      !isActive &&
                      "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium whitespace-nowrap",
                    isActive && "text-primary font-semibold",
                    isCompleted && "text-primary/70",
                    !isCompleted && !isActive && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connettore */}
              {!isLast && (
                <div
                  className="mx-2.5 h-px w-8 shrink-0 transition-colors duration-300"
                  style={{
                    background:
                      stepNumber < currentStep
                        ? "rgba(37,99,235,0.25)"
                        : "rgba(226,232,240,0.8)",
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
