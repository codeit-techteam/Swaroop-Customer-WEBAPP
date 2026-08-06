import type {
  AdaptiveTimelineStep,
  CheckoutCreditProfile,
  CheckoutPaymentMethodId,
  CheckoutPaymentOption,
  CreditTermDays,
} from "@/types/checkout-payment";

/** Prompt demo: ₹35,00,000 available credit for approved buyers. */
export const checkoutCreditProfileMock: CheckoutCreditProfile = {
  approved: true,
  availableCredit: 3_500_000,
  creditLimit: 5_000_000,
  creditUsed: 1_500_000,
};

export const DEFAULT_CHECKOUT_PAYMENT_METHOD: CheckoutPaymentMethodId =
  "advance";

export const DEFAULT_CREDIT_TERM_DAYS: CreditTermDays = 30;

export const CREDIT_TERM_OPTIONS: Array<{
  days: CreditTermDays;
  label: string;
}> = [
  { days: 15, label: "Net 15 Days" },
  { days: 30, label: "Net 30 Days" },
  { days: 45, label: "Net 45 Days" },
];

export const checkoutPaymentOptionsMock: CheckoutPaymentOption[] = [
  {
    id: "advance",
    title: "Advance Payment",
    description: "100% payment before dispatch.",
    timing: "Before Dispatch",
    benefits: [
      "Recommended for fastest approval",
      "Lowest risk",
      "Fast processing",
    ],
    badge: { label: "Recommended", variant: "recommended" },
    icon: "wallet",
    isCredit: false,
  },
  {
    id: "on_loading",
    title: "Pay Before Loading",
    description:
      "Payment after seller approval but before loading goods. Suitable for large procurement.",
    timing: "Before Loading",
    benefits: [
      "Pay after seller approval",
      "Suitable for large procurement",
      "No interest charges",
    ],
    icon: "package",
    isCredit: false,
  },
  {
    id: "on_delivery",
    title: "Cash On Delivery (On Delivery)",
    description:
      "Payment after delivery. Subject to PetroTrade approval. Available only for eligible customers.",
    timing: "On Delivery",
    benefits: [
      "Pay after delivery",
      "Subject to PetroTrade approval",
      "Eligible customers only",
    ],
    badge: { label: "Approval Required", variant: "approval" },
    icon: "truck",
    requiresSellerApprovalNote: true,
    isCredit: false,
  },
  {
    id: "credit",
    title: "Credit Purchase",
    description:
      "Buy now. Pay after 15 / 30 / 45 Days. Available only for approved credit customers.",
    timing: "Net Credit Terms",
    benefits: [
      "Buy now, pay later",
      "Uses approved credit limit",
      "Net 15 / 30 / 45 days",
    ],
    badge: { label: "Credit Available", variant: "credit" },
    icon: "calendar",
    isCredit: true,
  },
];

export function getCheckoutPaymentOption(
  id: CheckoutPaymentMethodId,
): CheckoutPaymentOption {
  return (
    checkoutPaymentOptionsMock.find((o) => o.id === id) ??
    checkoutPaymentOptionsMock[0]
  );
}

export function getCreditTermLabel(days: CreditTermDays): string {
  return (
    CREDIT_TERM_OPTIONS.find((o) => o.days === days)?.label ??
    `Net ${days} Days`
  );
}

export function paymentMethodSummaryLabel(
  methodId: CheckoutPaymentMethodId,
  creditTermDays?: CreditTermDays,
): string {
  if (methodId === "credit") {
    return creditTermDays
      ? `Credit · ${getCreditTermLabel(creditTermDays)}`
      : "Credit Purchase";
  }
  return getCheckoutPaymentOption(methodId).title;
}

/** Adaptive post-PO timeline by selected payment method. */
export function getAdaptiveTimeline(
  methodId: CheckoutPaymentMethodId,
): AdaptiveTimelineStep[] {
  switch (methodId) {
    case "advance":
      return [
        { id: "po_created", label: "Purchase Order" },
        { id: "seller_review", label: "Seller Approval" },
        { id: "proforma", label: "Proforma Invoice" },
        { id: "advance_payment", label: "Advance Payment" },
        { id: "tax_invoice", label: "Invoice" },
        { id: "shipment", label: "Shipment" },
        { id: "delivery", label: "Delivery" },
      ];
    case "on_loading":
      return [
        { id: "po_created", label: "Purchase Order" },
        { id: "seller_review", label: "Seller Approval" },
        { id: "proforma", label: "Proforma Invoice" },
        { id: "payment_before_loading", label: "Payment Before Loading" },
        { id: "loading", label: "Goods Ready For Loading" },
        { id: "tax_invoice", label: "Invoice" },
        { id: "shipment", label: "Shipment" },
        { id: "delivery", label: "Delivery" },
      ];
    case "on_delivery":
      return [
        { id: "po_created", label: "Purchase Order" },
        { id: "seller_review", label: "Seller Approval" },
        { id: "proforma", label: "Proforma Invoice" },
        { id: "shipment", label: "Shipment" },
        { id: "delivery", label: "Delivery" },
        { id: "payment_collection", label: "Payment Collection" },
      ];
    case "credit":
      return [
        { id: "po_created", label: "Purchase Order" },
        { id: "seller_review", label: "Seller Approval" },
        { id: "proforma", label: "Proforma Invoice" },
        { id: "credit_allocated", label: "Credit Allocated" },
        { id: "tax_invoice", label: "Invoice" },
        { id: "shipment", label: "Shipment" },
        { id: "delivery", label: "Delivery" },
        { id: "payment_due", label: "Payment Due" },
      ];
    default:
      return [
        { id: "po_created", label: "Purchase Order" },
        { id: "seller_review", label: "Seller Approval" },
        { id: "proforma", label: "Proforma Invoice" },
        { id: "advance_payment", label: "Payment" },
        { id: "shipment", label: "Shipment" },
        { id: "delivery", label: "Delivery" },
      ];
  }
}

/**
 * Map PO lifecycle state → timeline current index.
 * 0 = PO created (complete), current highlights active step.
 */
export function getTimelineCurrentIndex(input: {
  methodId: CheckoutPaymentMethodId;
  sellerApproved: boolean;
  hasProforma: boolean;
  paymentCompleted: boolean;
}): number {
  const { methodId, sellerApproved, hasProforma, paymentCompleted } = input;
  if (!sellerApproved) return 1; // Seller Approval current
  if (!hasProforma) return 2; // Proforma current (or next after approval)
  if (methodId === "advance" || methodId === "on_loading") {
    if (!paymentCompleted) return 3; // payment step
    return 4; // invoice / loading next
  }
  if (methodId === "credit") {
    // credit allocated immediately with PI in mock
    return paymentCompleted ? 4 : 3;
  }
  if (methodId === "on_delivery") {
    return 3; // shipment next after PI
  }
  return 2;
}

export function generateProformaNumber(): string {
  const seq = Math.floor(10000 + Math.random() * 90000);
  return `PI-2026-${seq}`;
}
