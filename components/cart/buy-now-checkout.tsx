"use client";

import { Suspense } from "react";
import { CheckoutFlow, CheckoutSkeleton } from "@/components/checkout";

export function CheckoutEntry() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutFlow />
    </Suspense>
  );
}
