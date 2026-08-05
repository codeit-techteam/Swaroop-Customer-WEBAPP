/**
 * Marketplace Offers domain — desktop Offers module for B2B petrochemical deals.
 */

import type {
  MarketplaceParentCategoryId,
  PaymentEligibilityId,
} from "@/types/marketplace";

export type OfferType =
  "flash_sale" | "bulk_discount" | "seasonal" | "new_arrival" | "credit";

export type OfferPaymentType = PaymentEligibilityId;

export type OfferSortBy =
  | "recommended"
  | "discount_desc"
  | "price_asc"
  | "savings_desc"
  | "ending_soon"
  | "newest";

export type OfferStatus =
  "active" | "ending_soon" | "expired" | "sold_out" | "upcoming" | "claimed";

export type OfferCategoryChip =
  | "all"
  | "polymers"
  | "chemicals"
  | "additives"
  | "base-oils"
  | "bulk_deals"
  | "limited_time"
  | "credit_eligible";

export type MyOfferTab = "available" | "applied" | "used" | "expired";

export interface MyOfferRecord {
  offerId: string;
  status: "available" | "applied" | "used" | "expired";
  appliedAt?: string;
  usedAt?: string;
}

export interface OfferBulkTier {
  id: string;
  minMt: number;
  label: string;
  currentPrice: number;
  discountPrice: number;
  savings: number;
}

export interface MarketplaceOffer {
  id: string;
  slug: string;
  title: string;
  description: string;
  termsAndConditions: string[];
  productId: string;
  productName: string;
  grade: string;
  categoryId: MarketplaceParentCategoryId;
  categoryLabel: string;
  brandId: string;
  brandName: string;
  brandShortName: string;
  sellerName: string;
  warehouseId: string;
  warehouseLabel: string;
  bannerImage: string;
  productImage: string;
  priceBefore: number;
  offerPrice: number;
  discountPercent: number;
  savings: number;
  moq: number;
  availableQuantity: number;
  remainingStock: number;
  expiresAt: string;
  validFrom?: string;
  offerType: OfferType;
  badge: string;
  paymentTypes: OfferPaymentType[];
  creditEligible: boolean;
  estimatedFreight: number;
  gstPercent: number;
  brochureUrl: string;
  isLimitedTime: boolean;
  isTrending: boolean;
  isMostRequested: boolean;
  campaignId?: string;
  bulkTiers?: OfferBulkTier[];
  views: number;
  requestCount: number;
  createdAt: string;
}

export interface OfferHeroBanner {
  id: string;
  offerId: string;
  title: string;
  description: string;
  discountBadge: string;
  expiresAt: string;
  backgroundImage: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface OfferSummaryStats {
  activeOffers: number;
  limitedTimeDeals: number;
  bulkDiscountCampaigns: number;
  creditEligibleOffers: number;
}

export interface OfferCampaign {
  id: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  offerCount: number;
  maxDiscountPercent?: number;
  eligibleProducts?: string;
  expiresAt?: string;
  hrefOfferType?: OfferType;
}

export interface CreditOfferCard {
  id: string;
  title: string;
  description: string;
  highlight: string;
  financePartner: string;
  ctaLabel: string;
  href: string;
}

export interface OfferFiltersState {
  categories: MarketplaceParentCategoryId[];
  brands: string[];
  warehouseId: string | null;
  priceMin: number;
  priceMax: number;
  paymentTypes: OfferPaymentType[];
  offerTypes: OfferType[];
  creditEligibleOnly: boolean;
  minQuantity: number | null;
  minDiscountPercent: number | null;
  inStockOnly: boolean;
}

export interface OfferPriceBounds {
  min: number;
  max: number;
  step: number;
}

export interface RecommendedOfferGroup {
  id: string;
  title: string;
  subtitle: string;
  offerIds: string[];
}
