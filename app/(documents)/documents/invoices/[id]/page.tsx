import type { Metadata } from "next";
import { InvoiceDetailPage } from "@/components/documents";

export const metadata: Metadata = {
  title: "Invoice Details",
};

export default function Page() {
  return <InvoiceDetailPage />;
}
