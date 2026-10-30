import type {
  BulkPricingTier,
  PaymentOption,
  SpotPriceInfo,
} from "@/types/product-details";

export function buildSpotPrice(pricePerMt: number): SpotPriceInfo {
  return {
    pricePerMt,
    yesterdayDelta: 0,
    trendDirection: "up",
    currency: "INR",
    unit: "MT",
    note: "Unit prices come from the live offer. Checkout totals are recalculated server-side.",
  };
}

/** Prefer seller-configured tiers from the offer. Never invent fake discounts. */
export function buildBulkPricing(
  _spotPricePerMt: number,
  configured?: Array<{
    id: string;
    minMt: number;
    maxMt: number | null;
    pricePerMt: number;
    quantityLabel: string;
  }>,
): BulkPricingTier[] {
  if (!configured || configured.length === 0) return [];
  return configured.map((tier) => ({
    id: tier.id,
    quantityLabel: tier.quantityLabel,
    pricePerMt: tier.pricePerMt,
    minMt: tier.minMt,
    maxMt: tier.maxMt,
  }));
}

export function buildPaymentOptions(creditEligible: boolean): PaymentOption[] {
  const standard: PaymentOption[] = [
    {
      id: "advance",
      title: "Advance",
      description: "Pay against the Proforma Invoice to lock the quoted price.",
      dueLabel: "Due before dispatch",
      eligible: true,
    },
    {
      id: "on_loading",
      title: "On Loading",
      description:
        "Pay once the material is loaded and the loading proof is shared.",
      dueLabel: "Due at loading confirmation",
      eligible: true,
    },
    {
      id: "on_delivery",
      title: "On Delivery",
      description: "Pay when the material is delivered and acknowledged.",
      dueLabel: "Due at delivery confirmation",
      eligible: true,
    },
  ];
  if (!creditEligible) return standard;
  return [
    ...standard,
    {
      id: "credit_15",
      title: "Credit 15 Days",
      description:
        "Available on this grade. Request credit to unlock Net-15 at checkout.",
      dueLabel: "Due 15 days after invoice",
      benefitLabel: "Request Credit to unlock",
      eligible: false,
    },
    {
      id: "credit_30",
      title: "Credit 30 Days",
      description:
        "Available on this grade. Request credit to unlock Net-30 at checkout.",
      dueLabel: "Due 30 days after invoice",
      benefitLabel: "Request Credit to unlock",
      eligible: false,
    },
  ];
}
