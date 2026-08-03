import type { Metadata } from "next";
import { DocumentsInvoicesPage } from "@/components/documents";

export const metadata: Metadata = {
  title: "Invoices",
};

export default function Page() {
  return <DocumentsInvoicesPage />;
}
