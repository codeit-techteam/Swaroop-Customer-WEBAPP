"use client";

import { Check } from "lucide-react";
import type { CreditApplicationStep } from "@/types/credit-application";
import { cn } from "@/lib/utils";

const STEPS: Array<{ id: CreditApplicationStep; label: string }> = [
  { id: "apply", label: "Apply" },
  { id: "upload", label: "Upload Documents" },
  { id: "review", label: "Under Review" },
  { id: "decision", label: "Approved / Rejected" },
];

interface CreditProcessStepperProps {
  activeStep: CreditApplicationStep;
  className?: string;
}

function stepIndex(step: CreditApplicationStep): number {
  return STEPS.findIndex((s) => s.id === step);
}

export function CreditProcessStepper({
  activeStep,
  className,
}: CreditProcessStepperProps) {
  const activeIdx = stepIndex(activeStep);

  return (
    <nav aria-label="Credit application progress" className={cn(className)}>
      <ol className="flex items-center">
        {STEPS.map((step, idx) => {
          const isComplete = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isUpcoming = idx > activeIdx;

          return (
            <li key={step.id} className="flex flex-1 items-center">
              <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                    isComplete &&
                      "border-emerald-500 bg-emerald-500 text-white",
                    isCurrent &&
                      "border-brand bg-brand text-white shadow-md shadow-brand/20",
                    isUpcoming && "border-slate-200 bg-white text-slate-400",
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={cn(
                    "hidden max-w-[7rem] text-xs font-medium leading-tight sm:block",
                    isCurrent && "text-brand",
                    isComplete && "text-emerald-700",
                    isUpcoming && "text-slate-400",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 ? (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 sm:mx-2",
                    idx < activeIdx ? "bg-emerald-400" : "bg-slate-200",
                  )}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-center text-sm font-medium text-slate-700 sm:hidden">
        {STEPS[activeIdx]?.label}
      </p>
    </nav>
  );
}
