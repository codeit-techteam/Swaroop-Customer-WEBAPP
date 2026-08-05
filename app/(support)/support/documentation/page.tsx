import type { Metadata } from "next";
import { SupportDocumentationPage } from "@/components/support";

export const metadata: Metadata = {
  title: "Documentation",
};

export default function Page() {
  return <SupportDocumentationPage />;
}
