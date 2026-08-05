import type { Metadata } from "next";
import { ApprovedPurchaseRequestPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

/** One-off approval confirmation (order generated card). */
export default function Page() {
  return <ApprovedPurchaseRequestPage />;
}
