import type { Metadata } from "next";
import { Suspense } from "react";
import { PurchaseRequestsListPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Purchase Requests",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PurchaseRequestsListPage />
    </Suspense>
  );
}
