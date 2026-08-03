import type { Metadata } from "next";
import { ActiveRequestsPage } from "@/components/purchase-requests";

export const metadata: Metadata = {
  title: "Active Requests",
};

export default function Page() {
  return <ActiveRequestsPage />;
}
