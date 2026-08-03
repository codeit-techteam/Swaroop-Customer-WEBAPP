import type { Metadata } from "next";
import { Suspense } from "react";
import { CreatePurchaseRequestPage } from "@/components/purchase-requests";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Create Purchase Request",
};

function CreateFallback() {
  return (
    <PageContainer>
      <Skeleton className="h-10 w-72" />
      <Skeleton className="mt-4 h-24 w-full rounded-2xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-[520px] rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </PageContainer>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CreateFallback />}>
      <CreatePurchaseRequestPage />
    </Suspense>
  );
}
