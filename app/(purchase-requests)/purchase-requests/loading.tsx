import { PrListSkeleton } from "@/components/purchase-requests/pr-list-skeleton";
import { SkeletonText } from "@/components/skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function PurchaseRequestsLoading() {
  return (
    <PageContainer>
      <div className="mb-4 space-y-2">
        <SkeletonText lines={2} className="max-w-md" />
      </div>
      <PrListSkeleton />
    </PageContainer>
  );
}
