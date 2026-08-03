import type { Metadata } from "next";
import { RejectedRequestsListPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Rejected Requests",
};

export default function Page() {
  return <RejectedRequestsListPage />;
}
