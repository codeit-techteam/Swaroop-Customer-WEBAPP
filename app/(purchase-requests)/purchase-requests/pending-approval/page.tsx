import type { Metadata } from "next";
import { PendingRequestsListPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Pending Confirmation",
};

export default function Page() {
  return <PendingRequestsListPage />;
}
