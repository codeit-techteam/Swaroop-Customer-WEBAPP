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
    note: "Prices are exclusive of GST (18%). Final quote is generated after seller approval of your purchase request.",
  };
}

/** Bulk tiers for desktop PDP — design ranges, priced from catalog spot. */
export function buildBulkPricing(spotPricePerMt: number): BulkPricingTier[] {
  return [
    {
      id: "tier-25-99",
      quantityLabel: "25 - 99 MT",
      pricePerMt: spotPricePerMt,
      minMt: 25,
      maxMt: 99,
    },
    {
      id: "tier-100-199",
      quantityLabel: "100 - 199 MT",
      pricePerMt: Math.round(spotPricePerMt * 0.987),
      minMt: 100,
      maxMt: 199,
    },
    {
      id: "tier-200-plus",
      quantityLabel: "200+ MT",
      pricePerMt: Math.round(spotPricePerMt * 0.972),
      minMt: 200,
      maxMt: null,
    },
  ];
}

export function buildPaymentOptions(creditEligible: boolean): PaymentOption[] {
  return [
    {
      id: "advance",
      title: "Advance Payment",
      description: "Pay before dispatch for preferred pricing.",
      eligible: true,
    },
    {
      id: "on_loading",
      title: "On Loading",
      description: "Pay after material loading confirmation.",
      eligible: true,
    },
    {
      id: "on_delivery",
      title: "On Delivery",
      description: "Pay after delivery confirmation.",
      eligible: true,
    },
    {
      id: "credit_15",
      title: "Credit 15 Days",
      description: "Net 15 days working capital.",
      surchargeLabel: "+1.5%",
      eligible: creditEligible,
    },
    {
      id: "credit_30",
      title: "Credit 30 Days",
      description: "Net 30 days extended terms.",
      surchargeLabel: "+2.5%",
      eligible: creditEligible,
    },
  ];
}
