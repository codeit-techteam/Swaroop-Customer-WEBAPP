import type { Metadata } from "next";
import { ProcessingOrdersPage } from "@/components/orders";

export const metadata: Metadata = {
  title: "Processing Orders",
};

export default function Page() {
  return <ProcessingOrdersPage />;
}
