import type { Metadata } from "next";
import { OnLoadingPaymentPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "On Loading Payment",
};

export default function Page() {
  return <OnLoadingPaymentPage />;
}
