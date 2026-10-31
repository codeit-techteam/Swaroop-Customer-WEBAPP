import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { NewGradeRequestForm } from "@/components/grade-requests/new-grade-request-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Request a new grade | Marketplace",
  description:
    "Ask PolyStoreX to source or add a grade that is not in the catalogue.",
};

export default function NewGradeRequestPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="max-w-3xl space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-64 rounded-2xl" />
        </PageContainer>
      }
    >
      <NewGradeRequestForm />
    </Suspense>
  );
}
