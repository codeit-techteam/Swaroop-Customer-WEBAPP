import type { Metadata } from "next";
import { PaymentsDashboardPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "Payments",
};

export default function Page() {
  return <PaymentsDashboardPage />;
}
