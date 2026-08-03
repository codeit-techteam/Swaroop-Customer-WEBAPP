import type { Metadata } from "next";
import { PaymentHistoryPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "Payment History",
};

export default function Page() {
  return <PaymentHistoryPage />;
}
