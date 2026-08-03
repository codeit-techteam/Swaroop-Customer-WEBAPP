import type { Metadata } from "next";
import { PurchaseOrdersPage } from "@/components/documents";

export const metadata: Metadata = {
  title: "Purchase Orders",
};

export default function Page() {
  return <PurchaseOrdersPage />;
}
