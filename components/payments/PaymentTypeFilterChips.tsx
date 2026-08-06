"use client";

import { cn } from "@/lib/utils";
import { PAYMENT_TYPE_LABELS } from "@/constants/payments";
import type { PaymentTypeId } from "@/types/payments";

export type PaymentTypeFilter = PaymentTypeId | "all";

const TYPE_OPTIONS: Array<{ value: PaymentTypeFilter; label: string }> = [
  { value: "all", label: "All Payments" },
  { value: "advance", label: PAYMENT_TYPE_LABELS.advance },
  { value: "on_loading", label: PAYMENT_TYPE_LABELS.on_loading },
  { value: "on_delivery", label: PAYMENT_TYPE_LABELS.on_delivery },
  { value: "credit_15", label: PAYMENT_TYPE_LABELS.credit_15 },
  { value: "credit_30", label: PAYMENT_TYPE_LABELS.credit_30 },
];

interface PaymentTypeFilterChipsProps {
  value: PaymentTypeFilter;
  counts: Record<PaymentTypeFilter, number>;
  onChange: (value: PaymentTypeFilter) => void;
  className?: string;
}

export function PaymentTypeFilterChips({
  value,
  counts,
  onChange,
  className,
}: PaymentTypeFilterChipsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-card",
        className,
      )}
    >
      {TYPE_OPTIONS.map((option) => {
        const active = value === option.value;
        const count = counts[option.value];
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-brand text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {option.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                active ? "bg-white/20 text-white" : "bg-white text-slate-500",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function parsePaymentTypeFilter(
  value: string | null,
): PaymentTypeFilter {
  const valid: PaymentTypeFilter[] = [
    "all",
    "advance",
    "on_loading",
    "on_delivery",
    "credit_15",
    "credit_30",
  ];
  if (value && valid.includes(value as PaymentTypeFilter)) {
    return value as PaymentTypeFilter;
  }
  return "all";
}
