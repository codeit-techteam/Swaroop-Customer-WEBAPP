/**
 * Product Details domain types — desktop PDP enriched from Customer App
 * ProductDetails + MarketplaceProduct catalog rows.
 */

export type PriceTrendDirection = "up" | "down";

export type ProductAvailabilityLevel =
  "high" | "medium" | "limited" | "out_of_stock";

export type PaymentMethodId =
  "advance" | "on_loading" | "on_delivery" | "credit_15" | "credit_30";

export type ComplianceDocumentType =
  "coa" | "msds" | "iso" | "test_certificate" | "quality_report";

export interface ProductGalleryImage {
  id: string;
  url: string;
  alt: string;
}

export interface ProductSpecRow {
  id: string;
  label: string;
  value: string;
  standard?: string;
}

export interface BulkPricingTier {
  id: string;
  quantityLabel: string;
  pricePerMt: number;
  minMt: number;
  maxMt: number | null;
}

export interface SpotPriceInfo {
  pricePerMt: number;
  yesterdayDelta: number;
  trendDirection: PriceTrendDirection;
  currency: "INR";
  unit: "MT";
  note: string;
}

export interface PaymentOption {
  id: PaymentMethodId;
  title: string;
  description: string;
  surchargeLabel?: string;
  eligible: boolean;
}

export interface ComplianceDocument {
  id: string;
  type: ComplianceDocumentType;
  title: string;
  description: string;
  fileName: string;
}

export interface LogisticsEstimate {
  warehouse: string;
  warehouseRegion: string;
  deliveryLocation: string;
  estimatedDelivery: string;
  transportMode: string;
  freightLabel: string;
  freightPerMt: number;
}

export interface QualityAssurance {
  title: string;
  subtitle: string;
  badges: string[];
}

export interface RelatedProductCard {
  id: string;
  name: string;
  brandName: string;
  categoryLabel: string;
  pricePerMt: number;
  warehouseLabel: string;
  stockLabel: string;
  imageUrl: string;
  href: string;
}

export interface ProductDetailRecord {
  id: string;
  sku: string;
  name: string;
  brandName: string;
  brandShortName: string;
  manufacturer: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  materialType: string;
  grade: string;
  description: string;
  casNumber: string;
  hsnCode: string;
  application: string;
  industry: string;
  packaging: string;
  origin: string;
  warehouseId: string;
  warehouseLabel: string;
  stock: number;
  stockLabel: string;
  moq: number;
  moqLabel: string;
  eta: string;
  availability: ProductAvailabilityLevel;
  availabilityLabel: string;
  gallery: ProductGalleryImage[];
  quality: QualityAssurance;
  specs: ProductSpecRow[];
  documents: ComplianceDocument[];
  spotPrice: SpotPriceInfo;
  bulkPricing: BulkPricingTier[];
  paymentOptions: PaymentOption[];
  logistics: LogisticsEstimate;
  relatedProductIds: string[];
  creditEligible: boolean;
}
