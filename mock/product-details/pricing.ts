import type {
  BulkPricingTier,
  PaymentOption,
  SpotPriceInfo,
} from "@/types/product-details";

export function buildSpotPrice(pricePerMt: number): SpotPriceInfo {
  const yesterdayDelta = Math.round(pricePerMt * 0.0045);
  return {
    pricePerMt,
    yesterdayDelta,
    trendDirection: "up",
    currency: "INR",
    unit: "MT",
    note: "Prices are exclusive of GST (18%). Final quote is generated after PetroTrade confirmation of your purchase request.",
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
  return [
    {
      id: "advance",
      title: "Advance",
      description: "Pay before dispatch for preferred pricing.",
      benefitLabel: "Platform Discount Eligible",
      discountRate: 0.05,
      eligible: true,
    },
    {
      id: "on_loading",
      title: "On Loading",
      description: "Pay after material loading confirmation.",
      benefitLabel: "Standard Terms",
      eligible: true,
    },
    {
      id: "on_delivery",
      title: "On Delivery",
      description: "Pay after delivery confirmation.",
      benefitLabel: "Standard Terms",
      eligible: true,
    },
    {
      id: "credit_15",
      title: "PetroTrade Credit — 15 Days",
      description:
        "PetroTrade managed working capital. Seller does not extend credit.",
      benefitLabel: "Approval Required",
      eligible: creditEligible,
    },
    {
      id: "credit_30",
      title: "PetroTrade Credit — 30 Days",
      description:
        "PetroTrade managed working capital. Seller does not extend credit.",
      benefitLabel: "Approval Required",
      eligible: creditEligible,
    },
  ];
}
