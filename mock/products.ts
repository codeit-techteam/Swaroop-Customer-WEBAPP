import type { RecommendedProduct } from "@/types/dashboard";
import type {
  MarketplaceProduct,
  PaymentEligibilityOption,
  PricingTier,
  ProductSpec,
  StockLevel,
  TrustFeature,
} from "@/types/marketplace";

/** Production catalog is loaded from PostgreSQL via Swaroop-Backend. */
export const productsMock: MarketplaceProduct[] = [];

export const DEFAULT_SPECS: ProductSpec[] = [
  {
    id: "mfr",
    label: "Melt Flow Rate (MFR)",
    value: "11.0 g/10 min",
    standard: "ASTM D1238 (230°C/2.16kg)",
  },
  {
    id: "density",
    label: "Density",
    value: "0.900 g/cm³",
    standard: "ASTM D792",
  },
  {
    id: "tensile",
    label: "Tensile Strength",
    value: "35 MPa",
    standard: "At Yield (50mm/min)",
  },
  {
    id: "flexural",
    label: "Flexural Modulus",
    value: "1500 MPa",
    standard: "ASTM D790",
  },
  {
    id: "impact",
    label: "Impact Strength",
    value: "High",
    standard: "ASTM D256",
  },
  {
    id: "processing",
    label: "Processing Method",
    value: "Injection Moulding",
    standard: "Recommended Process",
  },
];

export const DEFAULT_TRUST_FEATURES: TrustFeature[] = [
  {
    id: "network",
    title: "Verified Supply Network",
    description: "Supplier verification follows platform onboarding checks.",
    icon: "shield",
  },
  {
    id: "docs",
    title: "Quality Documentation",
    description:
      "COA and grade certificates are available when provided for the product.",
    icon: "check",
  },
  {
    id: "payment",
    title: "Secure Payment Protection",
    description:
      "Payment protection follows the configured payment and settlement process.",
    icon: "shield",
  },
  {
    id: "inspection",
    title: "Quality Inspection Available",
    description: "Third-party inspection can be requested where supported.",
    icon: "shield",
  },
  {
    id: "fulfilment",
    title: "Order and Fulfilment Support",
    description:
      "Purchase requests, dispatch coordination, and order tracking are handled on the platform.",
    icon: "check",
  },
];

export const DEFAULT_PROCUREMENT_TERMS = [
  "Minimum Increment: 25 MT",
  "Payment Terms: Advance / Credit",
  "Delivery Subject to Stock",
  "Price may change daily",
  "GST Extra",
  "Freight calculated during checkout",
];

/** Payment eligibility options — mirrors Customer App payment methods. */
export const PAYMENT_ELIGIBILITY_OPTIONS: PaymentEligibilityOption[] = [
  {
    id: "advance",
    title: "Advance Payment",
    description: "Pay before dispatch and get preferred pricing.",
  },
  {
    id: "on_loading",
    title: "On Loading",
    description: "Pay after material loading confirmation.",
  },
  {
    id: "on_delivery",
    title: "On Delivery",
    description: "Payment required after delivery confirmation.",
  },
  {
    id: "credit_15",
    title: "Credit 15 Days",
    description: "Net 15 days — short-term working capital.",
  },
  {
    id: "credit_30",
    title: "Credit 30 Days",
    description: "Net 30 days — extended payment flexibility.",
  },
];

/** @deprecated Prefer importing from `@/mock/recommendations` */
export const recommendedProductsMock: RecommendedProduct[] = [
  {
    id: "mkt-pp-raffia",
    name: "PP Raffia Grade",
    grade: "PP",
    description:
      "High-tenacity raffia grade for woven sacks and industrial packaging.",
    priceInr: 92800,
    unit: "MT",
    imageUrl: "",
    stockStatus: "in_stock",
    category: "polymers",
  },
  {
    id: "mkt-hdpe-f1002",
    name: "Polysure F1002",
    grade: "HDPE",
    description:
      "Blown film HDPE grade for flexible packaging, liners and industrial film applications.",
    priceInr: 91200,
    unit: "MT",
    imageUrl: "",
    stockStatus: "in_stock",
    category: "polymers",
  },
  {
    id: "mkt-pvc-s65",
    name: "S-65 Suspension Grade",
    grade: "PVC",
    description:
      "Suspension PVC resin for pipe, fittings and rigid profile extrusion.",
    priceInr: 98750,
    unit: "MT",
    imageUrl: "",
    stockStatus: "limited",
    category: "polymers",
  },
];

export const getProductById = (id: string): MarketplaceProduct | undefined =>
  productsMock.find((product) => product.id === id);

export const formatMarketPrice = (price: number): string =>
  `₹${price.toLocaleString("en-IN")}`;

export const formatStockLabel = (stock: number): string =>
  `${stock.toLocaleString("en-IN")} MT`;

export const formatMoqLabel = (moq: number): string => `${moq} MT`;

export const getStockLevel = (stock: number): StockLevel => {
  if (stock >= 500) return "high";
  if (stock >= 100) return "medium";
  return "low";
};

export const buildPricingTiers = (basePricePerKg: number): PricingTier[] => {
  const tier1 = basePricePerKg;
  const tier2 = Math.round((basePricePerKg - 2.5) * 100) / 100;
  const tier3 = Math.round((basePricePerKg - 6) * 100) / 100;

  const formatTotal = (price: number, mt: number, suffix = ""): string => {
    const total = Math.round(price * mt * 1000);
    return `₹${total.toLocaleString("en-IN")}${suffix}`;
  };

  return [
    {
      id: "tier-standard",
      quantityLabel: "1 - 10 MT",
      unitPrice: tier1,
      totalEstimate: formatTotal(tier1, 10),
      rateLabel: "Standard Rate",
      minMt: 1,
      maxMt: 10,
    },
    {
      id: "tier-volume",
      quantityLabel: "11 - 50 MT",
      unitPrice: tier2,
      totalEstimate: `${formatTotal(tier2, 11)}+`,
      rateLabel: "Volume Discount",
      savingsLabel: "Save ₹2.50/kg",
      minMt: 11,
      maxMt: 50,
    },
    {
      id: "tier-enterprise",
      quantityLabel: "50+ MT",
      unitPrice: tier3,
      totalEstimate: `${formatTotal(tier3, 50)}+`,
      rateLabel: "Enterprise Rate",
      savingsLabel: "Save ₹6/kg",
      minMt: 50,
      maxMt: null,
    },
  ];
};
