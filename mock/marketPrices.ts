import type { MarketPrice } from "@/types/dashboard";

/**
 * Market price cards — INR / MT (India market).
 * Static reference prices for the Customer Portal dashboard.
 */
export const marketPricesMock: MarketPrice[] = [
  {
    id: "mp-pp",
    code: "PP",
    label: "PP (Grades)",
    priceInr: 98200,
    unit: "MT",
    changePercent: 1.2,
    trend: "up",
  },
  {
    id: "mp-hdpe",
    code: "HDPE",
    label: "PE (HDPE)",
    priceInr: 102400,
    unit: "MT",
    changePercent: -0.5,
    trend: "down",
  },
  {
    id: "mp-pvc",
    code: "PVC",
    label: "PVC (S-65)",
    priceInr: 82000,
    unit: "MT",
    changePercent: 0.8,
    trend: "up",
  },
  {
    id: "mp-pet",
    code: "PET",
    label: "PET (Bottle)",
    priceInr: 94500,
    unit: "MT",
    changePercent: 0,
    trend: "flat",
  },
];

export const MARKET_PRICES_UPDATED_AT = "14:02 IST";
