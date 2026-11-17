import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import {
  GradeDirectoryPage,
  GradeTableSkeleton,
} from "@/components/marketplace/grades/grade-directory-page";
import { ROUTES } from "@/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Grade Directory",
  description:
    "Browse the PolyStoreX Grade Master by category, grade group and manufacturer.",
  path: ROUTES.marketplaceGrades,
});

export default function MarketplaceGradesPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <GradeTableSkeleton />
        </PageContainer>
      }
    >
      <GradeDirectoryPage />
    </Suspense>
  );
}
