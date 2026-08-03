import type { Metadata } from "next";
import { Suspense } from "react";
import { DeliveryUpdatesPage } from "@/components/shipment-tracking";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Delivery Updates",
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
      <DeliveryUpdatesPage />
    </Suspense>
  );
}
