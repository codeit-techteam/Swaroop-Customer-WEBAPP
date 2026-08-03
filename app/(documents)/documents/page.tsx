import type { Metadata } from "next";
import { DocumentsDashboardPage } from "@/components/documents";

export const metadata: Metadata = {
  title: "Documents",
};

export default function Page() {
  return <DocumentsDashboardPage />;
}
