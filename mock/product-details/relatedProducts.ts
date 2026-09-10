import { ROUTES } from "@/constants";
import { getProductById } from "@/mock/products";
import type { RelatedProductCard } from "@/types/product-details";

export function getRelatedProductCards(
  relatedProductIds: string[],
): RelatedProductCard[] {
  return relatedProductIds
    .map((id) => getProductById(id))
    .filter((product): product is NonNullable<typeof product> =>
      Boolean(product),
    )
    .map((product) => ({
      id: product.id,
      name: product.name,
      brandName: "Verified Supply",
      categoryLabel: `${product.materialType}`.toUpperCase(),
      pricePerMt: product.price,
      warehouseLabel: product.origin || product.warehouseLabel,
      stockLabel: `${product.stock.toLocaleString("en-IN")} MT`,
      imageUrl: "",
      href: `${ROUTES.marketplaceProduct}/${product.id}`,
    }));
}
