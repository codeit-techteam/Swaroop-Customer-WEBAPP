"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckoutStepId = "review" | "delivery" | "payment" | "confirm";

const STEPS: { id: CheckoutStepId; label: string; hint: string }[] = [
  { id: "review", label: "Review", hint: "Products & qty" },
  { id: "delivery", label: "Delivery", hint: "Address & GST" },
  { id: "payment", label: "Payment", hint: "Select method" },
  { id: "confirm", label: "Confirm", hint: "Generate PO" },
];

interface CheckoutStepperProps {
  current: CheckoutStepId;
  onStepClick?: (step: CheckoutStepId) => void;
  className?: string;
}

export function CheckoutStepper({
  current,
  onStepClick,
  className,
}: CheckoutStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <nav
      aria-label="Checkout progress"
      className={cn(
        "overflow-x-auto rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-card sm:px-5",
        className,
      )}
    >
      <ol className="flex min-w-[520px] items-center justify-between gap-1">
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const clickable = Boolean(onStepClick) && index <= currentIndex;

          return (
            <li key={step.id} className="flex flex-1 items-center gap-1.5">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onStepClick?.(step.id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-0.5 transition",
                  clickable && "hover:bg-slate-50",
                  !clickable && "cursor-default",
                )}
              >
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
                    "whitespace-nowrap text-[11px] font-semibold",
                    active ? "text-brand" : "text-slate-600",
                  )}
                >
                  {step.label}
                </span>
                <span className="hidden text-[10px] text-slate-400 sm:block">
                  {step.hint}
                </span>
              </button>
              {index < STEPS.length - 1 ? (
                <div
                  className={cn(
                    "mb-6 h-0.5 flex-1 rounded-full",
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

export const CHECKOUT_STEP_ORDER = STEPS.map((s) => s.id);
