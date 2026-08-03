import type { Metadata } from "next";
import { PendingRequestsListPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Pending Seller Approval",
};

export default function Page() {
  return <PendingRequestsListPage />;
}
