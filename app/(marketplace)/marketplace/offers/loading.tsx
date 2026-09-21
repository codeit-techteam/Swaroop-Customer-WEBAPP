import { OffersPageSkeleton } from "@/components/marketplace/offers/offers-page-skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function OffersLoading() {
  return (
    <PageContainer className="max-w-[1440px]">
      <OffersPageSkeleton />
    </PageContainer>
  );
}
