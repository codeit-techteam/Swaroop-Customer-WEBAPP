import { PageContainer } from "@/components/layout/page-container";
import { GradeTableSkeleton } from "@/components/marketplace/grades/grade-directory-page";

export default function MarketplaceGradesLoading() {
  return (
    <PageContainer>
      <GradeTableSkeleton />
    </PageContainer>
  );
}
