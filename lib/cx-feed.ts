import { env } from "@/lib/env";
import { useDashboardStore } from "@/store/dashboardStore";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import type {
  MarketplaceParentCategoryId,
  MarketplaceProduct,
  MaterialGradeCategory,
} from "@/types/marketplace";
import type {
  BulkPricingTier,
  ComplianceDocument,
  PaymentOption,
  ProductDetailRecord,
  ProductSpecRow,
} from "@/types/product-details";
import {
  buildBulkPricing,
  buildPaymentOptions,
  buildSpotPrice,
  DEFAULT_QUALITY_ASSURANCE,
  getFeaturesForMaterial,
  buildProductHighlights,
  buildLogisticsEstimate,
  buildGalleryFromProduct,
} from "@/mock/product-details";

interface PublishedSpec {
  label: string;
  value: string;
  standard?: string;
}

interface PublishedBulkPrice {
  minQty: number;
  maxQty: number | null;
  price: number;
}

interface PublishedPaymentTerm {
  id: PaymentOption["id"];
  title: string;
  description: string;
  enabled?: boolean;
  surchargePct?: number;
  discountPct?: number;
}

interface PublishedDocument {
  name: string;
  type: string;
  fileName: string;
}

export interface PublishedProduct {
  id: string;
  sku?: string;
  name: string;
  grade: string;
  material: string;
  brand: string;
  categoryId: string;
  description: string;
  images: string[];
  packaging: string;
  unit: string;
  moq: number;
  availableQty: number;
  stockIndicator: "in_stock" | "limited" | "out_of_stock";
  location: string;
  origin?: string;
  casNumber?: string;
  hsnCode?: string;
  application?: string;
  applications?: string[];
  industry?: string;
  creditEligible?: boolean;
  highlights?: string[];
  qualityBadges?: string[];
  deliveryAvailable?: boolean;
  specifications?: PublishedSpec[];
  sellingPrice: number;
  marketPrice?: number;
  deliveryCharge?: number;
  transportMode?: string;
  bulkPrices?: PublishedBulkPrice[];
  paymentTerms?: PublishedPaymentTerm[];
  documents?: PublishedDocument[];
  etaLabel: string;
}

interface PublishedBanner {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  status: string;
}

interface PublishedOffer {
  id: string;
  name: string;
  discountValue: number;
  minQty: number;
  terms: string;
  status: string;
}

interface PublishedSnapshot {
  publishedAt: string;
  products: PublishedProduct[];
  banners: PublishedBanner[];
  offers: PublishedOffer[];
}

const MATERIAL_MAP: Record<string, MaterialGradeCategory> = {
  Polypropylene: "Polypropylene",
  HDPE: "HDPE",
  LDPE: "HDPE",
  LLDPE: "LLDPE",
  PVC: "PVC",
  PET: "PET",
};

let publishedCache: PublishedProduct[] = [];

export function getPublishedProductsCache(): PublishedProduct[] {
  return publishedCache;
}

function toParentCategory(categoryId: string): MarketplaceParentCategoryId {
  if (categoryId.includes("other") || categoryId.includes("chem")) {
    return "chemicals";
  }
  return "polymers";
}

function toMarketplaceProduct(product: PublishedProduct): MarketplaceProduct {
  return {
    id: product.id,
    name: product.name,
    grade: product.grade,
    gradeCode: product.grade,
    categoryId: toParentCategory(product.categoryId),
    materialType: MATERIAL_MAP[product.material] ?? product.material ?? "Polypropylene",
    brandId: "seller-private",
    brandName: "PRIVATE",
    brandShortName: "PRIVATE",
    description: product.description,
    price: product.sellingPrice,
    unit: "MT",
    origin: product.origin || product.location || "Western India Region",
    warehouseId: "wh-published",
    warehouseLabel: product.location || "Western India Region",
    stock: product.availableQty,
    moq: product.moq,
    eta: product.etaLabel,
    badge:
      product.stockIndicator === "limited" ? "Limited Stock" : "Best Value",
    image: "",
    images: [],
    casNumber: product.casNumber ?? "",
    applications:
      product.applications?.length
        ? product.applications
        : product.application
          ? [product.application]
          : [product.packaging],
    creditEligible: product.creditEligible ?? true,
    stockStatus: product.stockIndicator,
    createdAt: new Date().toISOString(),
    popularityScore: 90,
    supplyOrigin: "domestic",
    verified: true,
    availableQuantity: product.availableQty,
    sellerId: "SELLER-PRIVATE-CX",
    sellerVisible: false,
  };
}

function tierLabel(tier: PublishedBulkPrice, unit: string) {
  if (tier.maxQty == null) return `${tier.minQty}+ ${unit}`;
  return `${tier.minQty} - ${tier.maxQty} ${unit}`;
}

function mapBulkPricing(
  product: PublishedProduct,
): BulkPricingTier[] | null {
  if (!product.bulkPrices?.length) return null;
  return [...product.bulkPrices]
    .sort((a, b) => a.minQty - b.minQty)
    .map((tier, index) => ({
      id: `tier-${product.id}-${index}`,
      quantityLabel: tierLabel(tier, product.unit || "MT"),
      pricePerMt: tier.price,
      minMt: tier.minQty,
      maxMt: tier.maxQty,
    }));
}

function mapPaymentOptions(product: PublishedProduct): PaymentOption[] | null {
  if (!product.paymentTerms?.length) return null;
  return product.paymentTerms
    .filter((term) => term.enabled !== false)
    .map((term) => ({
      id: term.id,
      title: term.title,
      description: term.description,
      surchargeLabel:
        term.surchargePct != null ? `+${term.surchargePct}%` : undefined,
      benefitLabel:
        term.discountPct != null
          ? `${term.discountPct}% Discount Eligible`
          : term.id.startsWith("credit")
            ? "Approval Required"
            : "Standard Terms",
      discountRate:
        term.discountPct != null ? term.discountPct / 100 : undefined,
      eligible: true,
    }));
}

function mapSpecs(product: PublishedProduct): ProductSpecRow[] | null {
  if (!product.specifications?.length) return null;
  return product.specifications.map((spec, index) => ({
    id: `spec-${product.id}-${index}`,
    label: spec.label,
    value: spec.value,
    standard: spec.standard,
  }));
}

function isOptionalProductDownload(name: string, type?: string): boolean {
  const label = `${name} ${type ?? ""}`.toUpperCase();
  return label.includes("TDS") || label.includes("MSDS");
}

function mapDocuments(
  product: PublishedProduct,
): ComplianceDocument[] | null {
  if (!product.documents?.length) return null;
  const mapped = product.documents
    .filter((doc) => isOptionalProductDownload(doc.name, doc.type))
    .map((doc, index) => {
      const isMsds = `${doc.name} ${doc.type}`.toUpperCase().includes("MSDS");
      return {
        id: `doc-${product.id}-${index}`,
        type: isMsds ? ("msds" as const) : ("test_certificate" as const),
        title: isMsds ? "MSDS" : "TDS",
        description: isMsds
          ? "Material safety data sheet"
          : "Technical data sheet",
        fileName: doc.fileName,
      };
    });
  return mapped.length > 0 ? mapped : null;
}

function availabilityFromPublished(product: PublishedProduct) {
  if (product.stockIndicator === "out_of_stock" || product.availableQty <= 0) {
    return { level: "out_of_stock" as const, label: "OUT OF STOCK" };
  }
  if (product.stockIndicator === "limited" || product.availableQty < 100) {
    return { level: "limited" as const, label: "LIMITED STOCK" };
  }
  if (product.availableQty >= 400) {
    return { level: "high" as const, label: "HIGH AVAILABILITY" };
  }
  return { level: "medium" as const, label: "IN STOCK" };
}

/** Build a full PDP record from an admin-published catalog product. */
export function publishedProductToDetail(
  product: PublishedProduct,
): ProductDetailRecord {
  const availability = availabilityFromPublished(product);
  const creditEligible = product.creditEligible ?? true;
  const materialType = MATERIAL_MAP[product.material] ?? product.material;
  const categoryName = product.material || "Polymers";
  const moq = product.moq;
  const bulkPricing =
    mapBulkPricing(product) ?? buildBulkPricing(product.sellingPrice);
  const paymentOptions =
    mapPaymentOptions(product) ?? buildPaymentOptions(creditEligible);
  const specs = mapSpecs(product) ?? [];
  const documents = mapDocuments(product) ?? [];
  const galleryImages = product.images.length
    ? product.images
    : [product.images[0] ?? ""];

  return {
    id: product.id,
    sku: product.sku || product.id.toUpperCase(),
    name: product.name,
    brandName: product.brand,
    brandShortName: product.brand.slice(0, 10).toUpperCase(),
    manufacturer: product.brand,
    categoryId: toParentCategory(product.categoryId),
    categoryName,
    categorySlug: categoryName.toLowerCase().replace(/\s+/g, "-"),
    materialType,
    grade: product.grade,
    description: product.description,
    casNumber: product.casNumber ?? "",
    hsnCode: product.hsnCode ?? "3902.10.00",
    application:
      product.application ||
      product.applications?.[0] ||
      materialType,
    applications:
      product.applications?.length
        ? product.applications
        : product.application
          ? [product.application]
          : [product.packaging],
    features: getFeaturesForMaterial(materialType),
    highlights:
      product.highlights?.length
        ? product.highlights
        : buildProductHighlights(creditEligible),
    industry: product.industry ?? "Petrochemicals & Packaging",
    packaging: product.packaging,
    origin: product.origin || product.location,
    warehouseId: "wh-published",
    warehouseLabel: product.location,
    stock: product.availableQty,
    stockLabel:
      product.availableQty >= 400
        ? `${product.availableQty}+ MT Available`
        : `${product.availableQty.toLocaleString("en-IN")} MT Available`,
    moq,
    moqLabel: `${moq} MT (1 Truckload)`,
    eta: product.etaLabel,
    availability: availability.level,
    availabilityLabel: availability.label,
    gallery:
      galleryImages.length > 1
        ? galleryImages.map((url, index) => ({
            id: `img-${product.id}-${index}`,
            url,
            alt: `${product.name} image ${index + 1}`,
          }))
        : buildGalleryFromProduct(galleryImages[0] ?? "", product.name),
    quality: {
      ...DEFAULT_QUALITY_ASSURANCE,
      badges: product.qualityBadges?.length
        ? product.qualityBadges
        : DEFAULT_QUALITY_ASSURANCE.badges,
      subtitle:
        "Issued Through PetroTrade Quality Assurance · Verified By PetroTrade QC · NABL Approved Laboratory",
    },
    specs:
      specs.length > 0
        ? specs
        : [
            {
              id: `spec-${product.id}-fallback`,
              label: "Grade",
              value: product.grade,
              standard: product.material,
            },
          ],
    documents,
    spotPrice: buildSpotPrice(product.sellingPrice),
    bulkPricing,
    paymentOptions,
    logistics: {
      ...buildLogisticsEstimate({
        warehouseLabel: product.location,
        eta: product.etaLabel,
      }),
      freightPerMt: product.deliveryCharge ?? 1250,
      freightLabel: product.deliveryCharge
        ? `₹${product.deliveryCharge.toLocaleString("en-IN")} / MT`
        : "Freight calculated at quote stage",
      transportMode: product.transportMode ?? "Road Freight (FTL)",
    },
    relatedProductIds: publishedCache
      .filter((item) => item.id !== product.id)
      .slice(0, 8)
      .map((item) => item.id),
    creditEligible,
  };
}

export async function hydrateCustomerExperienceFeed() {
  try {
    const response = await fetch(`${env.cxApiUrl}/api/cx/published`, {
      cache: "no-store",
    });
    if (!response.ok) return;
    const payload = (await response.json()) as { data?: PublishedSnapshot };
    const snapshot = payload.data;
    if (!snapshot?.products?.length) return;

    publishedCache = snapshot.products;
    const mapped = snapshot.products.map(toMarketplaceProduct);
    useMarketplaceStore.setState({
      products: mapped,
      isLoading: false,
    });

    const hero = snapshot.banners[0];
    const offer = snapshot.offers[0];
    useDashboardStore.setState({
      ...(hero
        ? {
            hero: {
              heading: hero.title,
              subtitle: hero.subtitle,
              imageUrl: hero.imageUrl,
            },
          }
        : {}),
      recommendedProducts: mapped.slice(0, 4).map((product) => ({
        id: product.id,
        name: product.name,
        grade: product.grade,
        description: product.description,
        priceInr: product.price,
        unit: "MT" as const,
        imageUrl: product.image,
        stockStatus: product.stockStatus,
        category:
          product.categoryId === "chemicals"
            ? ("chemicals" as const)
            : ("polymers" as const),
      })),
      ...(offer
        ? {
            promotion: {
              id: offer.id,
              badge: "LIVE OFFER",
              title: offer.name,
              description: offer.terms,
              ctaLabel: "View Offer",
              href: "/marketplace",
              minQuantityMt: offer.minQty,
            },
          }
        : {}),
    });
  } catch {
    // Seller panel feed is optional while both apps run independently.
  }
}
