import type { Metadata } from "next";
import { SubmittedPurchaseRequestPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Purchase Request Submitted",
};

export default function Page() {
  return <SubmittedPurchaseRequestPage />;
}
