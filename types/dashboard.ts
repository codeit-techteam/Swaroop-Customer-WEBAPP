/**
 * Dashboard domain types — mirrors Customer App procurement lifecycle
 * with web MVP Purchase Request terminology.
 */

export type PriceTrend = "up" | "down" | "flat";

export type PurchaseRequestStatus =
  | "pending_seller_approval"
  | "approved"
  | "processing"
  | "ready_for_dispatch"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type ActivityType =
  | "purchase_request_submitted"
  | "seller_approved"
  | "payment_reminder"
  | "shipment_update"
  | "document_available"
  | "price_alert";

export type ProductStockStatus = "in_stock" | "limited" | "out_of_stock";

export type MarketplaceCategoryId =
  "polymers" | "chemicals" | "liquids" | "additives";

export interface MarketPrice {
  id: string;
  code: string;
  label: string;
  priceInr: number;
  unit: "MT";
  changePercent: number;
  trend: PriceTrend;
}

export interface CreditSummary {
  availableCredit: number;
  creditLimit: number;
  currency: "INR";
  /** Percentage of limit still available (0–100) */
  availablePercent: number;
}

export interface OutstandingPayment {
  amount: number;
  currency: "INR";
  invoiceId: string;
  dueLabel: string;
}

export interface PurchaseRequestSummary {
  id: string;
  displayId: string;
  material: string;
  materialDetail: string;
  quantityMt: number;
  status: PurchaseRequestStatus;
  orderId: string | null;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  href?: string;
}

export interface CategoryCardItem {
  id: MarketplaceCategoryId;
  name: string;
  imageUrl: string;
  href: string;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  grade: string;
  description: string;
  priceInr: number;
  unit: "MT";
  imageUrl: string;
  stockStatus: ProductStockStatus;
  category: MarketplaceCategoryId;
}

export interface PromotionOffer {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
}

export interface HeroBannerContent {
  heading: string;
  subtitle: string;
  imageUrl: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export interface DashboardData {
  hero: HeroBannerContent;
  marketPrices: MarketPrice[];
  marketPricesUpdatedAt: string;
  credit: CreditSummary;
  outstanding: OutstandingPayment;
  purchaseRequests: PurchaseRequestSummary[];
  recentActivity: ActivityItem[];
  categories: CategoryCardItem[];
  recommendedProducts: RecommendedProduct[];
  promotion: PromotionOffer;
}
