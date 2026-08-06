import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersPage } from "@/components/orders";

export const metadata: Metadata = {
  title: "Orders",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrdersPage />
    </Suspense>
  );
}
