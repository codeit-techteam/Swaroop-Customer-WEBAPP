import type { Metadata } from "next";
import { ProductDetailsPage } from "@/components/product-details";
import { getProductById, productsMock } from "@/mock/products";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return productsMock.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  return {
    title: product ? `${product.name} | Marketplace` : "Product | Marketplace",
    description:
      product?.description ??
      "Marketplace product details from PetroTrade catalog.",
  };
}

/**
 * Allow admin-published CX catalog IDs (e.g. prod-pp-h110ma) through.
 * Client product store resolves published feed first, then local mocks.
 */
export default async function MarketplaceProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;
  return <ProductDetailsPage productId={id} />;
}
