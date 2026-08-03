import type { Metadata } from "next";
import { CreditPaymentPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "Credit 30 Days",
};

export default function Page() {
  return <CreditPaymentPage mode="credit_30" />;
}
