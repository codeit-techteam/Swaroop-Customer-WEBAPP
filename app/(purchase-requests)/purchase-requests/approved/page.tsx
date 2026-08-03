import type { Metadata } from "next";
import { ApprovedRequestsListPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Approved Requests",
};

export default function Page() {
  return <ApprovedRequestsListPage />;
}
