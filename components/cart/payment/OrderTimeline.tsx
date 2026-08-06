"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdaptiveTimelineStep } from "@/types/checkout-payment";

interface OrderTimelineProps {
  steps: AdaptiveTimelineStep[];
  /** Index of the current (in-progress) step */
  currentIndex: number;
  className?: string;
}

export function OrderTimeline({
  steps,
  currentIndex,
  className,
}: OrderTimelineProps) {
  return (
    <ol className={cn("space-y-0", className)}>
      {steps.map((step, idx) => {
        const complete = idx < currentIndex;
        const current = idx === currentIndex;
        return (
          <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
            {idx < steps.length - 1 ? (
              <span
                className={cn(
                  "absolute left-[11px] top-6 h-[calc(100%-12px)] w-px",
                  complete ? "bg-emerald-300" : "bg-slate-200",
                )}
              />
            ) : null}
            <div
              className={cn(
                "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                complete && "bg-emerald-500 text-white",
                current && "border-2 border-brand bg-white text-brand",
                !complete &&
                  !current &&
                  "border border-slate-200 text-slate-300",
              )}
            >
              {complete ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-current" />
              )}
            </div>
            <p
              className={cn(
                "pt-0.5 text-sm font-medium",
                complete && "text-emerald-700",
                current && "text-brand",
                !complete && !current && "text-slate-400",
              )}
            >
              {step.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
