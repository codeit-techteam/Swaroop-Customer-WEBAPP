"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PurchaseOrderSuccessPage } from "@/components/cart";
import {
  isLivePurchaseRequestSuccess,
  PurchaseRequestSuccessPage,
} from "@/components/checkout";

function SuccessRouter() {
  const searchParams = useSearchParams();
  if (isLivePurchaseRequestSuccess(searchParams)) {
    return <PurchaseRequestSuccessPage />;
  }
  return <PurchaseOrderSuccessPage />;
}

export function CheckoutSuccessEntry() {
  return (
    <Suspense fallback={null}>
      <SuccessRouter />
    </Suspense>
  );
}
