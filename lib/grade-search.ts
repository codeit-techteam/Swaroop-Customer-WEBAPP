import type {
  GradeOriginFilter,
  MarketplaceProduct,
  ProductSupplyOrigin,
} from "@/types/marketplace";

/** Product IDs catalogued as imported international grades */
export const IMPORTED_PRODUCT_IDS = new Set([
  "mkt-pc-resin",
  "mkt-abs-resin",
  "mkt-pp-copolymer",
  "mkt-meg",
  "mkt-toluene",
  "mkt-pet-fiber",
  "mkt-hdpe-pipe",
  "mkt-eva-resin",
  "mkt-dop",
  "mkt-base-oil-g3",
]);

export function getProductSupplyOrigin(
  product: MarketplaceProduct,
): ProductSupplyOrigin {
  if (product.supplyOrigin) return product.supplyOrigin;
  return IMPORTED_PRODUCT_IDS.has(product.id) ? "imported" : "domestic";
}

export function matchesGradeQuery(
  product: MarketplaceProduct,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    product.name,
    product.grade,
    product.materialType,
    product.brandName,
    product.brandShortName,
    product.description,
    product.origin,
    product.warehouseLabel,
    product.casNumber,
    ...product.applications,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export function searchProductsByGrade(
  products: MarketplaceProduct[],
  query: string,
  origin: GradeOriginFilter,
): MarketplaceProduct[] {
  return products.filter((product) => {
    if (!matchesGradeQuery(product, query)) return false;
    if (origin === "all") return true;
    return getProductSupplyOrigin(product) === origin;
  });
}

export function formatPricePerKg(pricePerMt: number): string {
  return (pricePerMt / 1000).toFixed(2);
}

export function gradeDisplayLabel(product: MarketplaceProduct): string {
  const origin = getProductSupplyOrigin(product);
  const originTag = origin === "imported" ? "Imported" : "Domestic";
  return `${product.name} (${product.brandShortName}) · ${originTag}`;
}
