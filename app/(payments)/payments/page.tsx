import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentsPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "Payments",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PaymentsPage />
    </Suspense>
  );
}
