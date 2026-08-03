"use client";

import { PaymentMethodOptionCard } from "./PaymentMethodOptionCard";
import { AdvancePaymentCard } from "./AdvancePaymentCard";
import { LoadingPaymentCard } from "./LoadingPaymentCard";
import { DeliveryPaymentCard } from "./DeliveryPaymentCard";
import { Credit15Card } from "./Credit15Card";
import { Credit30Card } from "./Credit30Card";
import {
  creditEligibilityMock,
  PAYMENT_COMPARISON_DISCLAIMER,
  PAYMENT_MATRIX_INFO,
  paymentMethodsMock,
} from "@/mock/purchase-request";
import type { PaymentMethodId } from "@/types/purchase-request";

interface PaymentSelectorProps {
  selectedMethodId: PaymentMethodId;
  orderBaseAmount: number;
  onSelect: (id: PaymentMethodId) => void;
}

export function PaymentSelector({
  selectedMethodId,
  orderBaseAmount,
  onSelect,
}: PaymentSelectorProps) {
  const eligibility = creditEligibilityMock;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Choose Payment Method
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Select the most suitable payment option for this order.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {PAYMENT_MATRIX_INFO}
        </p>
      </div>

      <div className="space-y-3" role="radiogroup" aria-label="Payment methods">
        {paymentMethodsMock.map((method) => {
          const creditDisabled =
            method.hasCredit &&
            (!eligibility.approved ||
              (method.id === "credit_15" && !eligibility.eligibleFor15) ||
              (method.id === "credit_30" && !eligibility.eligibleFor30));

          return (
            <PaymentMethodOptionCard
              key={method.id}
              method={method}
              selected={selectedMethodId === method.id}
              disabled={creditDisabled}
              onSelect={onSelect}
            />
          );
        })}
      </div>

      {selectedMethodId === "advance" ? <AdvancePaymentCard /> : null}
      {selectedMethodId === "on_loading" ? <LoadingPaymentCard /> : null}
      {selectedMethodId === "on_delivery" ? <DeliveryPaymentCard /> : null}
      {selectedMethodId === "credit_15" ? (
        <Credit15Card eligibility={eligibility} orderAmount={orderBaseAmount} />
      ) : null}
      {selectedMethodId === "credit_30" ? (
        <Credit30Card eligibility={eligibility} orderAmount={orderBaseAmount} />
      ) : null}

      <p className="text-[11px] leading-relaxed text-slate-400">
        {PAYMENT_COMPARISON_DISCLAIMER}
      </p>
    </div>
  );
}
