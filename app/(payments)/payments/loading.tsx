import { PaymentsPageSkeleton } from "@/components/payments/payments-page-skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function PaymentsLoading() {
  return (
    <PageContainer>
      <PaymentsPageSkeleton />
    </PageContainer>
  );
}
