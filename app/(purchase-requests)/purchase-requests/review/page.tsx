import type { Metadata } from "next";
import { ReviewPurchaseRequestPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Review Purchase Request",
};

export default function Page() {
  return <ReviewPurchaseRequestPage />;
}
