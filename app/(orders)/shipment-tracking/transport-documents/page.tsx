import type { Metadata } from "next";
import { Suspense } from "react";
import { TransportDocumentsPage } from "@/components/shipment-tracking";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Transport Documents",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        </PageContainer>
      }
    >
      <TransportDocumentsPage />
    </Suspense>
  );
}
