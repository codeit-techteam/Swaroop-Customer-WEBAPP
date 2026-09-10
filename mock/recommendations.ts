import type { RecommendedProduct } from "@/types/dashboard";
import { productsMock } from "./products";

/**
 * Dashboard recommended strip — data-first grades (no product images).
 */
export const recommendedProductsMock: RecommendedProduct[] = productsMock
  .filter((product) => product.categoryId === "polymers")
  .slice(0, 6)
  .map((product) => ({
    id: product.id,
    name: product.name,
    grade: product.grade,
    description: product.description,
    priceInr: product.price,
    unit: "MT" as const,
    imageUrl: "",
    stockStatus: product.stockStatus,
    category:
      product.categoryId === "base-oils"
        ? ("liquids" as const)
        : product.categoryId === "additives"
          ? ("additives" as const)
          : product.categoryId === "chemicals"
            ? ("chemicals" as const)
            : ("polymers" as const),
  }));
