import type { Metadata } from "next";
import { PurchaseOrderDetailPage } from "@/components/documents";

export const metadata: Metadata = {
  title: "Purchase Order Details",
};

export default function Page() {
  return <PurchaseOrderDetailPage />;
}
