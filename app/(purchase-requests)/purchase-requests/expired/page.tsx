import type { Metadata } from "next";
import { ExpiredRequestsListPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Expired Requests",
};

export default function Page() {
  return <ExpiredRequestsListPage />;
}
