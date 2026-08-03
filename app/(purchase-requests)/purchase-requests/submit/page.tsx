import type { Metadata } from "next";
import { SubmitPurchaseRequestPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Submit Purchase Request",
};

export default function Page() {
  return <SubmitPurchaseRequestPage />;
}
