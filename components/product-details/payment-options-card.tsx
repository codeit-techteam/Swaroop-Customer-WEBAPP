"use client";

import { CheckCircle2 } from "lucide-react";
import type { PaymentOption } from "@/types/product-details";
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
      <ul className="mt-3 space-y-2">
        {eligible.map((option) => (
          <li
            key={option.id}
            className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
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
          </li>
        ))}
      </ul>
    </div>
  );
}
