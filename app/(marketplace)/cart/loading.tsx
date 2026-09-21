import { MarketplaceBrowseSkeleton } from "@/components/marketplace/marketplace-skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function CartLoading() {
  return (
    <PageContainer>
      <MarketplaceBrowseSkeleton />
    </PageContainer>
  );
}
