import type { Metadata } from "next";
import { OnDeliveryPaymentPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "On Delivery Payment",
};

export default function Page() {
  return <OnDeliveryPaymentPage />;
}
