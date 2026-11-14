import type { MarketplaceProduct } from "@/types/marketplace";
import type { MarketplaceOffer } from "@/types/offers";

/** Stable key for “one card per grade” recommendations (not per seller listing). */
export function gradeKeyForProduct(product: {
  gradeId?: string | null;
  gradeCode?: string;
  grade: string;
}): string {
  return (
    product.gradeId?.trim() ||
    product.gradeCode?.trim() ||
    product.grade.trim() ||
    ""
  ).toLowerCase();
}

export function dedupeProductsByGrade<T extends MarketplaceProduct>(
  products: T[],
  limit?: number,
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const product of products) {
    const key = gradeKeyForProduct(product) || product.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(product);
    if (limit != null && out.length >= limit) break;
  }
  return out;
}

export function dedupeOffersByGrade(
  offers: MarketplaceOffer[],
): MarketplaceOffer[] {
  const seen = new Set<string>();
  const out: MarketplaceOffer[] = [];
  for (const offer of offers) {
    const key = (offer.grade || offer.productId || offer.id)
      .trim()
      .toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(offer);
  }
  return out;
}
