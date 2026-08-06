/**
 * Marketplace domain types — product catalog mirrors SWAROOP Customer App
 * MarketProduct / ProductDetails shapes, adapted for desktop Purchase Request flow.
 */

export type MarketplaceParentCategoryId =
  "polymers" | "chemicals" | "additives" | "base-oils";

export type MaterialGradeCategory =
  | "Polypropylene"
  | "HDPE"
  | "PVC"
  | "LLDPE"
  | "PET"
  | "Polycarbonate"
  | "ABS"
  | "EVA"
  | "Solvents"
  | "Plasticizers"
  | "Stabilizers"
  | "Group I"
  | "Group II"
  | "Group III";

export type MarketplaceAvailabilityBadge =
  | "Fastest Delivery"
  | "Lowest Cost"
  | "Premium Grade"
  | "Best Value"
  | "High Demand"
  | "Limited Stock";

export type StockLevel = "high" | "medium" | "low";

export type ProductStockStatus = "in_stock" | "limited" | "out_of_stock";

/** Domestic Indian supply vs imported international grades */
export type ProductSupplyOrigin = "domestic" | "imported";

export type GradeOriginFilter = "all" | ProductSupplyOrigin;

export type MarketplaceViewMode = "grid" | "list";

export type MarketplaceSortBy =
  "recommended" | "price_asc" | "price_desc" | "newest" | "popular";

export type PaymentEligibilityId =
  "advance" | "on_loading" | "on_delivery" | "credit_15" | "credit_30";

export type PriceTrendDirection = "up" | "down";

export interface MarketplaceBrand {
  id: string;
  name: string;
  shortName: string;
}

export interface MarketplaceWarehouse {
  id: string;
  name: string;
  region: string;
  location: string;
}

export interface MarketplaceCategory {
  id: MarketplaceParentCategoryId;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount: number;
}

export interface ProductSpec {
  id: string;
  label: string;
  value: string;
  standard: string;
}

export interface PricingTier {
  id: string;
  quantityLabel: string;
  unitPrice: number;
  totalEstimate: string;
  rateLabel: string;
  savingsLabel?: string;
  minMt: number;
  maxMt: number | null;
}

export interface ProductInfoItem {
  id: string;
  label: string;
  value: string;
  accent?: boolean;
}

export interface TrustFeature {
  id: string;
  title: string;
  description: string;
  icon: "check" | "shield";
}

export interface PaymentEligibilityOption {
  id: PaymentEligibilityId;
  title: string;
  description: string;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  grade: string;
  /** Parent browse category (Polymers / Chemicals / …) */
  categoryId: MarketplaceParentCategoryId;
  /** Material grade family from Customer App (Polypropylene, HDPE, …) */
  materialType: MaterialGradeCategory;
  brandId: string;
  brandName: string;
  brandShortName: string;
  description: string;
  price: number;
  unit: "MT";
  origin: string;
  warehouseId: string;
  warehouseLabel: string;
  stock: number;
  moq: number;
  eta: string;
  badge: MarketplaceAvailabilityBadge;
  image: string;
  images: string[];
  casNumber: string;
  applications: string[];
  creditEligible: boolean;
  stockStatus: ProductStockStatus;
  createdAt: string;
  popularityScore: number;
  /** Supply chain origin — domestic (India) or imported */
  supplyOrigin?: ProductSupplyOrigin;
}

export interface MarketplaceProductDetails extends MarketplaceProduct {
  breadcrumbCategory: string;
  breadcrumbProduct: string;
  nameLine2: string;
  basePricePerKg: number;
  marketPricePerKg: number;
  trendPercent: number;
  trendDirection: PriceTrendDirection;
  moqLabel: string;
  stockLabel: string;
  warehouseRegion: string;
  originRegion: string;
  packaging: string;
  qualityGrade: string;
  infoItems: ProductInfoItem[];
  specs: ProductSpec[];
  applicationNote: string;
  pricingTiers: PricingTier[];
  procurementTerms: string[];
  trustTitle: string;
  trustDescription: string;
  trustHighlight: string;
  trustFeatures: TrustFeature[];
  paymentEligibility: PaymentEligibilityOption[];
  quantityIncrement: number;
  relatedProductIds: string[];
}

export interface MarketplaceFiltersState {
  categories: MarketplaceParentCategoryId[];
  brands: string[];
  priceMin: number;
  priceMax: number;
  warehouseId: string | null;
  creditEligibleOnly: boolean;
}

export type MarketplaceFilterDraft = MarketplaceFiltersState;

export interface SortOption {
  value: MarketplaceSortBy;
  label: string;
}

export interface PriceRangeBounds {
  min: number;
  max: number;
  step: number;
}
