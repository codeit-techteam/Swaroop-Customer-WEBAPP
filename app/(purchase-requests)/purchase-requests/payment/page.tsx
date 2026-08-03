import type { Metadata } from "next";
import { PaymentSelectionPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Payment Method",
};

export default function Page() {
  return <PaymentSelectionPage />;
}
