import {
  buildPricingTiers,
  DEFAULT_PROCUREMENT_TERMS,
  DEFAULT_SPECS,
  DEFAULT_TRUST_FEATURES,
  getProductById,
  PAYMENT_ELIGIBILITY_OPTIONS,
  productsMock,
} from "@/mock/products";
import { categoriesMock } from "@/mock/categories";
import type {
  MarketplaceProduct,
  MarketplaceProductDetails,
} from "@/types/marketplace";

const pricePerKgFromMarket = (marketPricePerMt: number): number =>
  Math.round((marketPricePerMt / 1000) * 100) / 100;

/**
 * Builds full PDP payload from catalog row — mirrors Customer App
 * `getProductDetailsById` / `buildProductDetails`.
 */
export function getProductDetailsById(
  id: string,
): MarketplaceProductDetails | null {
  const product = getProductById(id);
  if (!product) return null;

  const basePricePerKg = pricePerKgFromMarket(product.price);
  const moq = Math.max(product.moq, 25);
  const eta = product.eta.includes("Business")
    ? product.eta
    : `${product.eta.replace("Days", "Business Days")}`;

  const relatedProductIds = productsMock
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.categoryId === product.categoryId ||
          item.materialType === product.materialType),
    )
    .slice(0, 4)
    .map((item) => item.id);

  const paymentEligibility = product.creditEligible
    ? PAYMENT_ELIGIBILITY_OPTIONS
    : PAYMENT_ELIGIBILITY_OPTIONS.filter(
        (option) => !option.id.startsWith("credit"),
      );

  const categoryName =
    categoriesMock.find((category) => category.id === product.categoryId)
      ?.name ?? "Polymers";

  return {
    ...product,
    breadcrumbCategory: categoryName,
    breadcrumbProduct: product.name,
    nameLine2: product.materialType,
    basePricePerKg,
    marketPricePerKg: basePricePerKg,
    trendPercent: 2.4,
    trendDirection: "up",
    moq,
    moqLabel: `${moq} MT (Full Truck)`,
    stockLabel: `${product.stock.toLocaleString("en-IN")} MT Available`,
    warehouseRegion: product.warehouseLabel,
    originRegion: "Western India",
    packaging: "25 KG Bags",
    qualityGrade: product.materialType,
    infoItems: [
      { id: "moq", label: "Minimum Order", value: `${moq} MT` },
      {
        id: "stock",
        label: "Stock Available",
        value: `${product.stock} MT`,
        accent: true,
      },
      { id: "eta", label: "Estimated Delivery", value: eta },
      {
        id: "warehouse",
        label: "Warehouse Region",
        value: product.warehouseLabel,
      },
      { id: "origin", label: "Origin Region", value: product.origin },
      { id: "packaging", label: "Packaging", value: "25 KG Bags" },
      {
        id: "quality",
        label: "Quality Grade",
        value: product.materialType,
      },
    ],
    specs: DEFAULT_SPECS,
    applicationNote:
      "Recommended for industrial procurement with verified supply-network fulfillment. Offers excellent processability for listed applications.",
    pricingTiers: buildPricingTiers(basePricePerKg),
    procurementTerms: DEFAULT_PROCUREMENT_TERMS,
    trustTitle: "Platform Assurance",
    trustDescription:
      "This product is supplied through PetroTrade's Verified Supply Network. Supplier identity remains protected until purchase request processing is completed.",
    trustHighlight: "Verified Supply Network",
    trustFeatures: DEFAULT_TRUST_FEATURES,
    paymentEligibility,
    quantityIncrement: 25,
    relatedProductIds,
    eta,
  };
}

export function getRelatedProducts(
  product: MarketplaceProductDetails,
): MarketplaceProduct[] {
  return product.relatedProductIds
    .map((id) => getProductById(id))
    .filter((item): item is MarketplaceProduct => Boolean(item));
}
