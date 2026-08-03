import type { Metadata } from "next";
import { PaymentNotificationsPage } from "@/components/payments/PaymentNotificationsPage";

export const metadata: Metadata = {
  title: "Payment Notifications",
};

export default function Page() {
  return <PaymentNotificationsPage />;
}
