import type {
  MarketplaceBrand,
  MarketplaceCategory,
  MarketplaceParentCategoryId,
  MarketplaceProduct,
  MarketplaceWarehouse,
  ProductSupplyOrigin,
  ProductTechnicalSpecs,
} from "@/types/marketplace";
import type { MarketplaceOffer, OfferPaymentType } from "@/types/offers";

export type BlindListing = {
  offerId: string;
  price: number | string;
  currency?: string;
  unit?: string;
  moq?: number | string | null;
  quantityAvailable?: number | string | null;
  leadTime?: string | null;
};

export type BlindProduct = {
  id: string;
  code: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  technicalSpecs?: Record<string, unknown> | null;
  mfi?: string | null;
  density?: string | null;
  packaging?: string | null;
  unit?: string;
  countryOfOrigin?: string | null;
  supplyOrigin?: string | null;
  listing?: BlindListing | null;
  grade?: {
    id: string;
    code: string;
    name: string;
    displayName?: string;
    category?: { id: string; code: string; name: string } | null;
  } | null;
};

const PARENT_FROM_GROUP: Record<string, MarketplaceParentCategoryId> = {
  POLYMERS: "polymers",
  COMPOUNDS: "polymers",
  MASTERBATCH: "additives",
  ELASTOMERS: "polymers",
  CHEMICALS: "chemicals",
  SOLVENTS: "chemicals",
  INTERMEDIATES: "chemicals",
  RECYCLED: "polymers",
  BASE_OILS: "base-oils",
  SPECIALTY: "additives",
};

function num(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function specsOf(product: BlindProduct): Record<string, unknown> {
  return product.technicalSpecs && typeof product.technicalSpecs === "object"
    ? product.technicalSpecs
    : {};
}

export function parentCategoryIdOf(product: BlindProduct): MarketplaceParentCategoryId {
  const specs = specsOf(product);
  const fromSpecs = specs.parentCategoryId;
  if (
    fromSpecs === "polymers" ||
    fromSpecs === "chemicals" ||
    fromSpecs === "additives" ||
    fromSpecs === "base-oils"
  ) {
    return fromSpecs;
  }
  const group = (product.grade as { category?: { parentGroup?: string } } | null)?.category
    ?.parentGroup;
  if (group && PARENT_FROM_GROUP[group]) return PARENT_FROM_GROUP[group];
  return "polymers";
}

export function toMarketplaceProduct(product: BlindProduct): MarketplaceProduct {
  const specs = specsOf(product);
  const listing = product.listing;
  const applications = Array.isArray(specs.applications)
    ? (specs.applications as string[])
    : [];
  const technicalSpecs: ProductTechnicalSpecs = {};
  if (product.mfi) technicalSpecs.mfi = product.mfi;
  if (product.density) technicalSpecs.density = product.density;
  if (typeof specs.form === "string") technicalSpecs.form = specs.form;
  if (typeof specs.mfi === "string" && !technicalSpecs.mfi) technicalSpecs.mfi = specs.mfi;
  if (typeof specs.density === "string" && !technicalSpecs.density)
    technicalSpecs.density = specs.density;

  const stock = num(listing?.quantityAvailable);
  const stockStatus =
    stock <= 0 ? "out_of_stock" : stock < 100 ? "limited" : "in_stock";

  return {
    id: product.id,
    name: product.name,
    grade: product.grade?.code ?? String(specs.materialType ?? product.code),
    gradeCode: product.code,
    categoryId: parentCategoryIdOf(product),
    materialType: String(specs.materialType ?? product.grade?.name ?? product.name),
    subCategory: typeof specs.subCategory === "string" ? specs.subCategory : undefined,
    brandId: "private",
    brandName: product.brand || "PRIVATE",
    brandShortName: "PVT",
    description: product.description ?? "",
    price: num(listing?.price),
    unit: "MT",
    origin: String(specs.origin ?? product.countryOfOrigin ?? ""),
    warehouseId: String(specs.warehouseId ?? "wh-all"),
    warehouseLabel: String(specs.warehouseLabel ?? "Verified Hub"),
    stock,
    moq: num(listing?.moq),
    eta: String(listing?.leadTime ?? specs.eta ?? ""),
    badge: (typeof specs.badge === "string" ? specs.badge : "Best Value") as MarketplaceProduct["badge"],
    image: "",
    images: [],
    casNumber: String(specs.casNumber ?? ""),
    applications,
    creditEligible: Boolean(specs.creditEligible),
    stockStatus,
    createdAt: new Date().toISOString(),
    popularityScore: num(specs.popularityScore, 50),
    supplyOrigin: (product.supplyOrigin === "imported" ? "imported" : "domestic") as ProductSupplyOrigin,
    technicalSpecs,
    verified: true,
    availableQuantity: stock,
    sellerVisible: false,
    offerId: listing?.offerId,
  };
}

const PARENT_CATEGORIES: Array<Omit<MarketplaceCategory, "productCount">> = [
  {
    id: "polymers",
    name: "Polymers",
    slug: "polymers",
    description:
      "PP, HDPE, PVC, LLDPE, PET and engineering polymers for industrial procurement.",
    imageUrl: "",
  },
  {
    id: "chemicals",
    name: "Chemicals",
    slug: "chemicals",
    description:
      "Industrial solvents and process chemicals for manufacturing operations.",
    imageUrl: "",
  },
  {
    id: "additives",
    name: "Additives",
    slug: "additives",
    description:
      "Plasticizers, stabilizers and performance additives for polymer compounds.",
    imageUrl: "",
  },
  {
    id: "base-oils",
    name: "Base Oils",
    slug: "base-oils",
    description:
      "Group I–III base oils for lubricant blending and industrial formulations.",
    imageUrl: "",
  },
];

export function getParentCategoryBySlug(slug: string): MarketplaceCategory | undefined {
  const category = PARENT_CATEGORIES.find((item) => item.slug === slug);
  return category ? { ...category, productCount: 0 } : undefined;
}

export function categoriesFromProducts(
  products: MarketplaceProduct[],
): MarketplaceCategory[] {
  return PARENT_CATEGORIES.map((category) => ({
    ...category,
    productCount: products.filter((item) => item.categoryId === category.id).length,
  }));
}

export function brandsFromProducts(products: MarketplaceProduct[]): MarketplaceBrand[] {
  const seen = new Map<string, MarketplaceBrand>();
  for (const product of products) {
    const id = product.brandId || "private";
    if (seen.has(id)) continue;
    seen.set(id, {
      id,
      name: product.brandName || "PRIVATE",
      shortName: product.brandShortName || "PVT",
    });
  }
  return [...seen.values()];
}

export function warehousesFromProducts(
  products: MarketplaceProduct[],
): MarketplaceWarehouse[] {
  const seen = new Map<string, MarketplaceWarehouse>();
  seen.set("wh-all", {
    id: "wh-all",
    name: "All Regions",
    region: "All",
    location: "All Regions",
  });
  for (const product of products) {
    const id = product.warehouseId || "wh-all";
    if (seen.has(id)) continue;
    const label = product.warehouseLabel || "Verified Hub";
    seen.set(id, {
      id,
      name: label,
      region: product.origin || "India",
      location: label,
    });
  }
  return [...seen.values()];
}

export type BlindOffer = {
  id: string;
  referenceNumber?: string;
  quantityAvailable?: number | string | null;
  moq?: number | string | null;
  unit?: string;
  price?: number | string | null;
  currency?: string;
  deliveryTerms?: string | null;
  validFrom?: string | Date | null;
  validUntil?: string | Date | null;
  status?: string;
  region?: string | null;
  product?: { id: string; code: string; name: string; unit?: string } | null;
  grade?: {
    id: string;
    code: string;
    name: string;
    displayName?: string;
  } | null;
  priceTiers?: Array<{
    minQty?: number | string | null;
    maxQty?: number | string | null;
    price?: number | string | null;
    currency?: string;
    paymentMethod?: string | null;
  }>;
  supplier?: { displayName?: string };
};

const CATEGORY_LABEL: Record<MarketplaceParentCategoryId, string> = {
  polymers: "Polymers",
  chemicals: "Chemicals",
  additives: "Additives",
  "base-oils": "Base Oils",
};

function mapPaymentMethod(method?: string | null): OfferPaymentType | null {
  const value = (method ?? "").toUpperCase();
  if (!value) return null;
  if (value.includes("ADVANCE") || value === "PREPAID") return "advance";
  if (value.includes("LOADING")) return "on_loading";
  if (value.includes("DELIVERY") || value.includes("COD")) return "on_delivery";
  if (value.includes("15")) return "credit_15";
  if (value.includes("30") || value.includes("CREDIT")) return "credit_30";
  return null;
}

export function toMarketplaceOffer(
  offer: BlindOffer,
  product?: MarketplaceProduct,
): MarketplaceOffer {
  const basePrice = num(offer.price);
  const tierPrices = (offer.priceTiers ?? [])
    .map((tier) => num(tier.price))
    .filter((price) => price > 0);
  const offerPrice = tierPrices.length ? Math.min(basePrice || Infinity, ...tierPrices) : basePrice;
  const priceBefore = Math.max(basePrice, offerPrice);
  const discountPercent =
    priceBefore > 0 && offerPrice < priceBefore
      ? Math.round(((priceBefore - offerPrice) / priceBefore) * 100)
      : 0;
  const stock = num(offer.quantityAvailable ?? product?.stock);
  const categoryId = product?.categoryId ?? "polymers";
  const expiresAt = offer.validUntil
    ? new Date(offer.validUntil).toISOString()
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const paymentTypes = [
    ...new Set(
      (offer.priceTiers ?? [])
        .map((tier) => mapPaymentMethod(tier.paymentMethod))
        .filter((item): item is OfferPaymentType => Boolean(item)),
    ),
  ];
  const title = product?.name ?? offer.product?.name ?? offer.grade?.name ?? "Marketplace offer";

  return {
    id: offer.id,
    slug: offer.referenceNumber ?? offer.id,
    title,
    description: product?.description || `${title} available from verified supply.`,
    termsAndConditions: [],
    productId: product?.id ?? offer.product?.id ?? "",
    productName: title,
    grade: product?.grade ?? offer.grade?.code ?? offer.grade?.name ?? "",
    categoryId,
    categoryLabel: CATEGORY_LABEL[categoryId],
    brandId: product?.brandId ?? "private",
    brandName: product?.brandName ?? "PRIVATE",
    brandShortName: product?.brandShortName ?? "PVT",
    sellerName: offer.supplier?.displayName ?? "ANONYMOUS SUPPLIER",
    warehouseId: product?.warehouseId ?? "wh-all",
    warehouseLabel: offer.region ?? product?.warehouseLabel ?? "Verified Hub",
    bannerImage: "",
    productImage: "",
    priceBefore,
    offerPrice,
    discountPercent,
    savings: Math.max(0, priceBefore - offerPrice),
    moq: num(offer.moq ?? product?.moq),
    availableQuantity: stock,
    remainingStock: stock,
    expiresAt,
    validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString() : undefined,
    offerType: discountPercent >= 5 ? "bulk_discount" : "new_arrival",
    badge: discountPercent >= 5 ? `${discountPercent}% OFF` : "Live Offer",
    paymentTypes: paymentTypes.length ? paymentTypes : ["advance"],
    creditEligible: Boolean(product?.creditEligible) || paymentTypes.includes("credit_15") || paymentTypes.includes("credit_30"),
    estimatedFreight: 0,
    gstPercent: 18,
    brochureUrl: "",
    isLimitedTime: Boolean(offer.validUntil),
    isTrending: num(product?.popularityScore, 0) >= 70,
    isMostRequested: false,
    bulkTiers: (offer.priceTiers ?? []).map((tier, index) => ({
      id: `${offer.id}-tier-${index}`,
      minMt: num(tier.minQty),
      label: tier.maxQty != null ? `${num(tier.minQty)}–${num(tier.maxQty)} MT` : `${num(tier.minQty)}+ MT`,
      currentPrice: priceBefore,
      discountPrice: num(tier.price, offerPrice),
      savings: Math.max(0, priceBefore - num(tier.price, offerPrice)),
    })),
    views: 0,
    requestCount: 0,
    createdAt: new Date().toISOString(),
  };
}
