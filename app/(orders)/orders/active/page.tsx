import type { Metadata } from "next";
import { ActiveOrdersPage } from "@/components/orders";

export const metadata: Metadata = {
  title: "Active Orders",
};

export default function Page() {
  return <ActiveOrdersPage />;
}
