import type { RecommendedProduct } from "@/types/dashboard";
import { productsMock } from "./products";

/**
 * Dashboard recommended strip — derived from marketplace catalog
 * (Customer App trending materials → Purchase Request CTA).
 */
export const recommendedProductsMock: RecommendedProduct[] = productsMock
  .filter((product) => product.categoryId === "polymers")
  .slice(0, 3)
  .map((product) => ({
    id: product.id,
    name: product.name,
    grade: product.grade,
    description: product.description,
    priceInr: product.price,
    unit: "MT" as const,
    imageUrl: product.image,
    stockStatus: product.stockStatus,
    category:
      product.categoryId === "base-oils" ? "liquids" : product.categoryId,
  }));
