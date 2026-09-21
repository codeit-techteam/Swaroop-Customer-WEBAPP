import { ProductDetailsPageSkeleton } from "@/components/product-details/product-details-skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function ProductLoading() {
  return (
    <PageContainer>
      <ProductDetailsPageSkeleton />
    </PageContainer>
  );
}
