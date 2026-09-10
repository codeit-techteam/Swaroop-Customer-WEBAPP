import type { MaterialTaxonomyItem } from "@/mock/materials-taxonomy";
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

export const SUGGESTION_PRODUCT_LIMIT = 8;
export const SUGGESTION_MATERIAL_LIMIT = 4;

export interface GradeSearchSuggestions {
  query: string;
  materials: MaterialTaxonomyItem[];
  products: MarketplaceProduct[];
  totalProducts: number;
}

export type GradeSearchSuggestionItem =
  | { type: "material"; id: string; material: MaterialTaxonomyItem }
  | { type: "product"; id: string; product: MarketplaceProduct }
  | { type: "view-all"; id: "view-all" };

export function getProductSupplyOrigin(
  product: MarketplaceProduct,
): ProductSupplyOrigin {
  if (product.supplyOrigin) return product.supplyOrigin;
  return IMPORTED_PRODUCT_IDS.has(product.id) ? "imported" : "domestic";
}

function productSearchHaystack(product: MarketplaceProduct): string {
  const specs = product.technicalSpecs
    ? Object.values(product.technicalSpecs).filter(Boolean).join(" ")
    : "";

  return [
    product.name,
    product.grade,
    product.gradeCode,
    product.materialType,
    product.subCategory,
    product.categoryId,
    product.description,
    product.origin,
    product.warehouseLabel,
    product.casNumber,
    specs,
    ...product.applications,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesGradeQuery(
  product: MarketplaceProduct,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return productSearchHaystack(product).includes(q);
}

function fieldScore(
  value: string | undefined,
  q: string,
  weights: { exact: number; prefix: number; word: number; includes: number },
): number {
  if (!value) return 0;
  const v = value.toLowerCase();
  if (v === q) return weights.exact;
  if (v.startsWith(q)) return weights.prefix;
  const tokens = v.split(/[\s\-_/.,()]+/).filter(Boolean);
  if (tokens.some((token) => token.startsWith(q))) return weights.word;
  if (q.length >= 2 && v.includes(q)) return weights.includes;
  return 0;
}

export function scoreProductMatch(
  product: MarketplaceProduct,
  query: string,
): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const shortQuery = q.length === 1;
  const best = shortQuery
    ? Math.max(
        fieldScore(product.gradeCode, q, {
          exact: 100,
          prefix: 88,
          word: 0,
          includes: 0,
        }),
        fieldScore(product.grade, q, {
          exact: 96,
          prefix: 84,
          word: 0,
          includes: 0,
        }),
        fieldScore(product.materialType, q, {
          exact: 90,
          prefix: 78,
          word: 0,
          includes: 0,
        }),
        fieldScore(product.name, q, {
          exact: 82,
          prefix: 70,
          word: 0,
          includes: 0,
        }),
      )
    : Math.max(
        fieldScore(product.gradeCode, q, {
          exact: 100,
          prefix: 88,
          word: 72,
          includes: 42,
        }),
        fieldScore(product.grade, q, {
          exact: 96,
          prefix: 84,
          word: 70,
          includes: 40,
        }),
        fieldScore(product.materialType, q, {
          exact: 90,
          prefix: 78,
          word: 64,
          includes: 36,
        }),
        fieldScore(product.name, q, {
          exact: 82,
          prefix: 70,
          word: 58,
          includes: 32,
        }),
        fieldScore(product.subCategory, q, {
          exact: 76,
          prefix: 62,
          word: 50,
          includes: 28,
        }),
        fieldScore(product.casNumber, q, {
          exact: 70,
          prefix: 50,
          word: 40,
          includes: 24,
        }),
        fieldScore(product.applications.join(" "), q, {
          exact: 50,
          prefix: 40,
          word: 34,
          includes: 18,
        }),
        q.length >= 3
          ? fieldScore(product.description, q, {
              exact: 0,
              prefix: 0,
              word: 16,
              includes: 12,
            })
          : 0,
      );

  if (best <= 0) return 0;
  return best + product.popularityScore / 1000;
}

export function scoreMaterialMatch(
  material: MaterialTaxonomyItem,
  query: string,
): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  return Math.max(
    fieldScore(material.code, q, {
      exact: 100,
      prefix: 90,
      word: 70,
      includes: 40,
    }),
    fieldScore(material.name, q, {
      exact: 92,
      prefix: 80,
      word: 64,
      includes: 36,
    }),
    fieldScore(material.parentGroup, q, {
      exact: 60,
      prefix: 40,
      word: 30,
      includes: 16,
    }),
  );
}

export function searchProductsByGrade(
  products: MarketplaceProduct[],
  query: string,
  origin: GradeOriginFilter,
): MarketplaceProduct[] {
  const q = query.trim().toLowerCase();
  const matched = products.filter((product) => {
    if (!matchesGradeQuery(product, query)) return false;
    if (origin === "all") return true;
    return getProductSupplyOrigin(product) === origin;
  });

  if (!q) return matched;

  return [...matched].sort((a, b) => {
    const scoreDelta = scoreProductMatch(b, q) - scoreProductMatch(a, q);
    if (scoreDelta !== 0) return scoreDelta;
    return b.popularityScore - a.popularityScore;
  });
}

export function getGradeSearchSuggestions(
  products: MarketplaceProduct[],
  materials: MaterialTaxonomyItem[],
  query: string,
  options?: {
    origin?: GradeOriginFilter;
    productLimit?: number;
    materialLimit?: number;
  },
): GradeSearchSuggestions {
  const q = query.trim().toLowerCase();
  const origin = options?.origin ?? "all";
  const productLimit = options?.productLimit ?? SUGGESTION_PRODUCT_LIMIT;
  const materialLimit = options?.materialLimit ?? SUGGESTION_MATERIAL_LIMIT;

  if (!q) {
    return { query, materials: [], products: [], totalProducts: 0 };
  }

  const rankedProducts = products
    .filter((product) => {
      if (origin !== "all" && getProductSupplyOrigin(product) !== origin) {
        return false;
      }
      return scoreProductMatch(product, q) > 0;
    })
    .sort((a, b) => {
      const scoreDelta = scoreProductMatch(b, q) - scoreProductMatch(a, q);
      if (scoreDelta !== 0) return scoreDelta;
      return b.popularityScore - a.popularityScore;
    });

  const rankedMaterials = materials
    .filter((material) => scoreMaterialMatch(material, q) > 0)
    .sort((a, b) => {
      const scoreDelta = scoreMaterialMatch(b, q) - scoreMaterialMatch(a, q);
      if (scoreDelta !== 0) return scoreDelta;
      return b.gradeCount - a.gradeCount;
    });

  return {
    query,
    materials: rankedMaterials.slice(0, materialLimit),
    products: rankedProducts.slice(0, productLimit),
    totalProducts: rankedProducts.length,
  };
}

export function flattenSearchSuggestions(
  suggestions: GradeSearchSuggestions,
  idPrefix = "",
): GradeSearchSuggestionItem[] {
  const prefixed = (value: string) =>
    idPrefix ? `${idPrefix}-${value}` : value;

  const items: GradeSearchSuggestionItem[] = suggestions.materials.map(
    (material) => ({
      type: "material" as const,
      id: prefixed(`material-${material.id}`),
      material,
    }),
  );

  for (const product of suggestions.products) {
    items.push({
      type: "product",
      id: prefixed(`product-${product.id}`),
      product,
    });
  }

  if (suggestions.query.trim()) {
    items.push({ type: "view-all", id: prefixed("view-all") });
  }

  return items;
}

export function formatPricePerKg(pricePerMt: number): string {
  return (pricePerMt / 1000).toFixed(2);
}

export function gradeDisplayLabel(product: MarketplaceProduct): string {
  const origin = getProductSupplyOrigin(product);
  const originTag = origin === "imported" ? "Imported" : "Domestic";
  return `${product.name} (${product.brandShortName}) · ${originTag}`;
}
