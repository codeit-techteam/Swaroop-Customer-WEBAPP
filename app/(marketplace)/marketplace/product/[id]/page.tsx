import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ProductDetailsPage,
  ProductDetailsPageSkeleton,
} from "@/components/product-details";
import { PageContainer } from "@/components/layout/page-container";

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
    description: "Marketplace product details from PolyStoreX catalog.",
  };
}

export default async function MarketplaceProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <PageContainer>
          <ProductDetailsPageSkeleton />
        </PageContainer>
      }
    >
      <ProductDetailsPage productId={id} />
    </Suspense>
  );
}
