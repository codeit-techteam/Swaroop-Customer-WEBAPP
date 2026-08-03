import type { Metadata } from "next";
import { RequestHistoryPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Request History",
};

export default function Page() {
  return <RequestHistoryPage />;
}
