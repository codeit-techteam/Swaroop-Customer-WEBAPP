import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function RootLoading() {
  return (
    <PageContainer>
      <LoadingSkeleton rows={6} />
    </PageContainer>
  );
}
