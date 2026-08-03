import type { Metadata } from "next";
import { AdvancePaymentPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "Advance Payment",
};

export default function Page() {
  return <AdvancePaymentPage />;
}
