import type { Metadata } from "next";
import { ApprovedPurchaseRequestPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Seller Approved",
};

/** One-off approval confirmation (order generated card). */
export default function Page() {
  return <ApprovedPurchaseRequestPage />;
}
