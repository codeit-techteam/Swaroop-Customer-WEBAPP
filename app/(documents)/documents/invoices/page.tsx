import type { Metadata } from "next";
import { DocumentsInvoicesPage } from "@/components/documents";

export const metadata: Metadata = {
  title: "Tax Invoices",
};

export default function Page() {
  return <DocumentsInvoicesPage />;
}
