"use client";

import {
  CREDIT_TERM_OPTIONS,
  checkoutCreditProfileMock,
  checkoutPaymentOptionsMock,
} from "@/mock/checkout-payment";
import { cn } from "@/lib/utils";
import { PaymentMethodCard } from "./PaymentMethodCard";
import type {
  CheckoutPaymentMethodId,
  CreditTermDays,
} from "@/types/checkout-payment";

interface CheckoutPaymentSelectorProps {
  selectedMethodId: CheckoutPaymentMethodId | null;
  creditTermDays: CreditTermDays;
  onSelect: (id: CheckoutPaymentMethodId) => void;
  onCreditTermChange: (days: CreditTermDays) => void;
  className?: string;
}

export function CheckoutPaymentSelector({
  selectedMethodId,
  creditTermDays,
  onSelect,
  onCreditTermChange,
  className,
}: CheckoutPaymentSelectorProps) {
  const creditProfile = checkoutCreditProfileMock;

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Select Payment Method
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          Choose how you want to pay for this order. Your selected payment
          method will be shared with PetroTrade during seller approval.
        </p>
      </div>

      <div className="space-y-3" role="radiogroup" aria-label="Payment methods">
        {checkoutPaymentOptionsMock.map((option) => (
          <PaymentMethodCard
            key={option.id}
            option={option}
            selected={selectedMethodId === option.id}
            creditProfile={option.isCredit ? creditProfile : undefined}
            showApprovalBadgeWhenSelected
            onSelect={onSelect}
          >
            {option.id === "credit" &&
            selectedMethodId === "credit" &&
            creditProfile.approved ? (
              <div className="pt-1">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Credit Term
                </p>
                <div className="flex flex-wrap gap-2">
                  {CREDIT_TERM_OPTIONS.map((term) => (
                    <button
                      key={term.days}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreditTermChange(term.days);
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                        creditTermDays === term.days
                          ? "border-brand bg-brand/[0.06] text-brand ring-1 ring-brand/20"
                          : "border-slate-200 text-slate-600 hover:border-slate-300",
                      )}
                    >
                      {term.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </PaymentMethodCard>
        ))}
      </div>
    </div>
  );
}
