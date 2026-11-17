import { Suspense } from "react";
import {
  ProductDetailsPage,
  ProductDetailsPageSkeleton,
} from "@/components/product-details";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants";
import { fetchPublicProductTitle } from "@/lib/catalogue-metadata";
import { pageMetadata } from "@/lib/seo";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const productName = await fetchPublicProductTitle(id);
  return pageMetadata({
    title: productName ?? "Product",
    description: productName
      ? `${productName} on the PolyStoreX marketplace.`
      : "Marketplace product details from the PolyStoreX catalogue.",
    path: `${ROUTES.marketplaceProduct}/${id}`,
  });
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
