import type { Metadata } from "next";
import { PurchaseOrdersPage } from "@/components/documents";

export const metadata: Metadata = {
  title: "Documents",
};

export default function Page() {
  return <PurchaseOrdersPage />;
}
