import type { Metadata } from "next";
import { ProductDetailsPage } from "@/components/product-details";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Product ${id} | Marketplace`,
    description: "Marketplace product details from PetroTrade catalog.",
  };
}

export default async function MarketplaceProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;
  return <ProductDetailsPage productId={id} />;
}
