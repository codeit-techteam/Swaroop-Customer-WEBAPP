import type { Metadata } from "next";
import { GstInvoicesPage } from "@/components/documents";

export const metadata: Metadata = {
  title: "GST Invoices",
};

export default function Page() {
  return <GstInvoicesPage />;
}
