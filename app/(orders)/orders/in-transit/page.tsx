import type { Metadata } from "next";
import { InTransitOrdersPage } from "@/components/orders";

export const metadata: Metadata = {
  title: "In Transit",
};

export default function Page() {
  return <InTransitOrdersPage />;
}
