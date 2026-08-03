import type { Metadata } from "next";
import { CancelledOrdersPage } from "@/components/orders";

export const metadata: Metadata = {
  title: "Cancelled Orders",
};

export default function Page() {
  return <CancelledOrdersPage />;
}
