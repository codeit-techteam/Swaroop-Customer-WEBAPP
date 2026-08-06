"use client";

import { useState } from "react";
import type { PaymentMethodId, PaymentOption } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface PaymentOptionsCardProps {
  options: PaymentOption[];
  className?: string;
}

export function PaymentOptionsCard({
  options,
  className,
}: PaymentOptionsCardProps) {
  const eligible = options.filter((option) => option.eligible);
  const [selectedId, setSelectedId] = useState<PaymentMethodId | null>(
    eligible[0]?.id ?? null,
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-slate-900">Payment Options</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        Eligible methods for this grade
      </p>
      <ul
        className="mt-3 space-y-2"
        role="radiogroup"
        aria-label="Payment options"
      >
        {eligible.map((option) => {
          const selected = option.id === selectedId;
          return (
            <li key={option.id}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSelectedId(option.id)}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  selected
                    ? "border-brand/30 bg-brand/5"
                    : "border-slate-100 bg-slate-50/70 hover:border-slate-200",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    selected
                      ? "border-brand bg-brand"
                      : "border-slate-300 bg-white",
                  )}
                  aria-hidden="true"
                >
                  {selected ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {option.title}
                    </p>
                    {option.surchargeLabel ? (
                      <span className="text-xs font-semibold text-slate-500">
                        {option.surchargeLabel}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500">{option.description}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
