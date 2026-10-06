import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import {
  GradeDirectoryPage,
  GradeTableSkeleton,
} from "@/components/marketplace/grades/grade-directory-page";

export const metadata: Metadata = {
  title: "Grade Directory | Marketplace",
  description:
    "Browse the PetroTrade Grade Master by category, grade group and manufacturer.",
};

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
