"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PurchaseRequestStep } from "@/types/purchase-request";

const STEPS: { id: PurchaseRequestStep; label: string }[] = [
  { id: "create", label: "Create" },
  { id: "review", label: "Review" },
  { id: "payment", label: "Payment" },
  { id: "submitted", label: "Submitted" },
  { id: "pending_approval", label: "Approval" },
  { id: "approved", label: "Approved" },
];

const ORDER: PurchaseRequestStep[] = STEPS.map((s) => s.id);

interface PurchaseRequestStepperProps {
  currentStep: PurchaseRequestStep;
  className?: string;
}

export function PurchaseRequestStepper({
  currentStep,
  className,
}: PurchaseRequestStepperProps) {
  const currentIndex = ORDER.indexOf(currentStep);

  return (
    <nav
      aria-label="Purchase request progress"
      className={cn(
        "overflow-x-auto rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-card",
        className,
      )}
    >
      <ol className="flex min-w-[640px] items-center justify-between gap-2">
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;

          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    done && "bg-brand text-white",
                    active &&
                      "bg-accent-blue text-white ring-4 ring-accent-blue/15",
                    !done && !active && "bg-slate-100 text-slate-500",
                  )}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-[11px] font-medium",
                    active ? "text-brand" : "text-slate-500",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 ? (
                <div
                  className={cn(
                    "mb-5 h-0.5 flex-1 rounded-full",
                    index < currentIndex ? "bg-brand" : "bg-slate-200",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
