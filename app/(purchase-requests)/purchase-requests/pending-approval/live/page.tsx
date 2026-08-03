import type { Metadata } from "next";
import { PendingApprovalPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Live Seller Approval",
};

/** Live countdown / validation timeline for the current in-flight request. */
export default function Page() {
  return <PendingApprovalPage />;
}
