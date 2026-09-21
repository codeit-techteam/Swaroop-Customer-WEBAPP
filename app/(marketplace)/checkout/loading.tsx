import { SkeletonForm, SkeletonDetails } from "@/components/skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function CheckoutLoading() {
  return (
    <PageContainer>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SkeletonForm fields={5} />
        <SkeletonDetails />
      </div>
    </PageContainer>
  );
}
