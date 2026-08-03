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
      brandName: product.brandName,
      categoryLabel: `${product.materialType}`.toUpperCase(),
      pricePerMt: product.price,
      warehouseLabel: product.warehouseLabel,
      stockLabel: `${product.stock.toLocaleString("en-IN")} MT`,
      imageUrl: product.image,
      href: `${ROUTES.marketplaceProduct}/${product.id}`,
    }));
}
