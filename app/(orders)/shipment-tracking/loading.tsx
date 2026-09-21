import { OrdersPageSkeleton } from "@/components/orders/orders-page-skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function ShipmentTrackingLoading() {
  return (
    <PageContainer>
      <OrdersPageSkeleton />
    </PageContainer>
  );
}
