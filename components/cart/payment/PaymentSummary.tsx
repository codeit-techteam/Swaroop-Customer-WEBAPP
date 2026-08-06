"use client";

import { cn } from "@/lib/utils";
import {
  getCreditTermLabel,
  paymentMethodSummaryLabel,
} from "@/mock/checkout-payment";
import type {
  CheckoutPaymentMethodId,
  CreditTermDays,
} from "@/types/checkout-payment";

interface PaymentSummaryProps {
  methodId: CheckoutPaymentMethodId | null;
  creditTermDays?: CreditTermDays;
  className?: string;
  compact?: boolean;
}

export function PaymentSummary({
  methodId,
  creditTermDays,
  className,
  compact,
}: PaymentSummaryProps) {
  if (!methodId) {
    return (
      <div className={cn("text-sm text-slate-500", className)}>
        {compact ? "Not selected" : "Select a payment method to continue"}
      </div>
    );
  }

  const label = paymentMethodSummaryLabel(methodId, creditTermDays);

  if (compact) {
    return (
      <span className={cn("text-sm font-medium text-slate-800", className)}>
        {label}
      </span>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Payment Method
      </p>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      {methodId === "credit" && creditTermDays ? (
        <p className="text-xs text-slate-500">
          {getCreditTermLabel(creditTermDays)}
        </p>
      ) : null}
    </div>
  );
}
