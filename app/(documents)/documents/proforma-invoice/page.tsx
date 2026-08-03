import type { Metadata } from "next";
import { ProformaInvoicesPage } from "@/components/documents";

export const metadata: Metadata = {
  title: "Proforma Invoice",
};

export default function Page() {
  return <ProformaInvoicesPage />;
}
