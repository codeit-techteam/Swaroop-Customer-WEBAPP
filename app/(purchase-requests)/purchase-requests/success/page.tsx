import type { Metadata } from "next";
import { Suspense } from "react";
import { PurchaseOrderSuccessPage } from "@/components/cart";

export const metadata: Metadata = {
  title: "Purchase Order Generated",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PurchaseOrderSuccessPage />
    </Suspense>
  );
}
