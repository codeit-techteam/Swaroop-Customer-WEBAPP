import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    description: product?.description,
  };
}

export default async function MarketplaceProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailsPage productId={id} />;
}
