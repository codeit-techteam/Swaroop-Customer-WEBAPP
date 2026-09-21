import type { MaterialTaxonomyItem } from "@/mock/materials-taxonomy";
import type { MarketplaceProduct } from "@/types/marketplace";

export function materialsFromCatalog(
  products: MarketplaceProduct[],
): MaterialTaxonomyItem[] {
  const buckets = new Map<string, MarketplaceProduct[]>();
  for (const product of products) {
    const name = product.materialType || product.grade;
    const list = buckets.get(name) ?? [];
    list.push(product);
    buckets.set(name, list);
  }

  return Array.from(buckets.entries()).map(([name, grades]) => {
    const prices = grades.map((item) => item.price).filter((price) => price > 0);
    const codes = grades.map((item) => item.grade).filter(Boolean);
    const shortest = [...codes].sort((a, b) => a.length - b.length)[0];
    const code =
      shortest ??
      (name.toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim() || name);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
      id: `mat-${slug}`,
      code: code.length > 16 ? grades[0]?.grade ?? code.slice(0, 16) : code,
      name,
      categoryId: grades[0]?.categoryId ?? "polymers",
      parentGroup: grades[0]?.categoryId ?? "polymers",
      gradeCount: grades.length,
      startingPrice: prices.length ? Math.min(...prices) : 0,
      slug,
    };
  });
}
