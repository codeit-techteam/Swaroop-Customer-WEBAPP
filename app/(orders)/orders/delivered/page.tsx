import type { Metadata } from "next";
import { DeliveredOrdersPage } from "@/components/orders";

export const metadata: Metadata = {
  title: "Delivered Orders",
};

export default function Page() {
  return <DeliveredOrdersPage />;
}
