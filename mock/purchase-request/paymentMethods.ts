import type { PaymentMethod, PaymentMethodId } from "@/types/purchase-request";

/** Flat Advance discount — mirrors SWAROOP `ADVANCE_PAYMENT_DISCOUNT`. */
export const ADVANCE_PAYMENT_DISCOUNT = 12500;

export const DEFAULT_PAYMENT_METHOD_ID: PaymentMethodId = "advance";

/**
 * Payment methods — mirrors SWAROOP `PAYMENT_METHODS` + comparison benefits.
 */
export const paymentMethodsMock: PaymentMethod[] = [
  {
    id: "advance",
    title: "Advance Payment",
    description: "Pay before dispatch and get preferred pricing.",
    badge: { label: "RECOMMENDED", variant: "recommended" },
    discount: ADVANCE_PAYMENT_DISCOUNT,
    interestRate: 0,
    timing: "Before dispatch",
    bestFor: "Best pricing & priority allocation",
    hasCredit: false,
    benefits: [
      "Lowest financial risk",
      "Preferred pricing",
      "Instant order processing",
      "No interest",
    ],
    eligibility: "All Users",
    risk: "Low Risk",
    icon: "wallet",
  },
  {
    id: "on_loading",
    title: "On Loading Payment",
    description:
      "Pay after material loading confirmation. Loading status verification required.",
    discount: 0,
    interestRate: 0,
    timing: "After loading confirmation",
    bestFor: "Verified loading before payment",
    hasCredit: false,
    benefits: [
      "Low financial risk",
      "Verified loading before payment",
      "No interest charges",
      "Suitable for verified buyers",
    ],
    eligibility: "Verified",
    risk: "Low Risk",
    icon: "package",
  },
  {
    id: "on_delivery",
    title: "On Delivery Payment",
    description: "Payment required after delivery confirmation.",
    badge: { label: "Eligible", variant: "eligible" },
    discount: 0,
    interestRate: 0,
    timing: "After delivery confirmation",
    bestFor: "Pay only when goods arrive",
    hasCredit: false,
    benefits: [
      "Pay when goods arrive",
      "No interest charges",
      "Medium operational risk",
      "Tier 1 eligibility required",
    ],
    eligibility: "Tier 1",
    risk: "Medium Risk",
    icon: "truck",
  },
  {
    id: "credit_15",
    title: "Credit 15 Days",
    description:
      "Short-term credit that uses your available limit with modest interest.",
    badge: { label: "Credit Available", variant: "credit" },
    discount: 0,
    interestRate: 1.5,
    creditLimit: 5000000,
    availableCredit: 3750000,
    timing: "Net 15 days",
    bestFor: "Short-term working capital",
    hasCredit: true,
    benefits: [
      "Better short-term cash flow",
      "Uses approved credit limit",
      "1.5% interest applies",
      "Approved buyers only",
    ],
    eligibility: "Approved",
    risk: "Uses Limit",
    icon: "calendar",
  },
  {
    id: "credit_30",
    title: "Credit 30 Days",
    description:
      "Extended credit terms for premium customers with higher interest.",
    badge: { label: "Premium Credit", variant: "premium" },
    discount: 0,
    interestRate: 2.5,
    creditLimit: 5000000,
    availableCredit: 3750000,
    timing: "Net 30 days",
    bestFor: "Extended payment flexibility",
    hasCredit: true,
    benefits: [
      "Better cash flow",
      "Higher interest",
      "Premium customers only",
      "Uses available credit limit",
    ],
    eligibility: "Premium",
    risk: "Uses Limit",
    icon: "calendar-check",
  },
];

export const getPaymentMethodById = (id: PaymentMethodId): PaymentMethod =>
  paymentMethodsMock.find((method) => method.id === id) ??
  paymentMethodsMock[0];

/**
 * Payment adjustments — mirrors SWAROOP `calculatePaymentAmounts`.
 */
export const calculatePaymentAmounts = (
  baseAmount: number,
  methodId: PaymentMethodId,
): {
  discount: number;
  interest: number;
  interestRate: number;
  payableAmount: number;
} => {
  const method = getPaymentMethodById(methodId);
  const discount =
    method.discount > 0 ? Math.min(method.discount, baseAmount) : 0;
  const interestRate = method.interestRate;
  const interest =
    interestRate > 0 ? Math.round(baseAmount * (interestRate / 100)) : 0;
  const payableAmount = Math.max(0, baseAmount - discount + interest);

  return { discount, interest, interestRate, payableAmount };
};

export const PAYMENT_MATRIX_INFO =
  "This comparison helps buyers select the most suitable payment method based on payment timing, discount, interest rate and eligibility.";

export const PAYMENT_COMPARISON_DISCLAIMER =
  "By selecting a payment method, you agree to the PetroTrade Industrial Service Terms and Credit Agreement protocols.";
