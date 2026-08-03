"use client";

import { Check, Circle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateDdMmYyyy } from "@/lib/format";
import type { PaymentTimelineStep } from "@/types/payments";

interface PaymentTimelineProps {
  steps: PaymentTimelineStep[];
  className?: string;
}

export function PaymentTimeline({ steps, className }: PaymentTimelineProps) {
  return (
    <ol className={cn("space-y-0", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const icon =
          step.status === "completed" ? (
            <Check className="h-3.5 w-3.5" />
          ) : step.status === "current" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : step.status === "failed" ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <Circle className="h-3 w-3" />
          );

        const tone =
          step.status === "completed"
            ? "border-emerald-500 bg-emerald-500 text-white"
            : step.status === "current"
              ? "border-brand bg-brand text-white"
              : step.status === "failed"
                ? "border-red-500 bg-red-500 text-white"
                : "border-slate-300 bg-white text-slate-400";

        return (
          <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast ? (
              <span
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-20px)] w-px",
                  step.status === "completed"
                    ? "bg-emerald-300"
                    : "bg-slate-200",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                tone,
              )}
            >
              {icon}
            </span>
            <div className="min-w-0 pt-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  step.status === "upcoming"
                    ? "text-slate-400"
                    : "text-slate-900",
                )}
              >
                {step.title}
              </p>
              {step.description ? (
                <p className="mt-0.5 text-xs text-slate-500">
                  {step.description}
                </p>
              ) : null}
              {step.at ? (
                <p className="mt-0.5 text-xs text-slate-400">
                  {formatDateDdMmYyyy(step.at)}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
