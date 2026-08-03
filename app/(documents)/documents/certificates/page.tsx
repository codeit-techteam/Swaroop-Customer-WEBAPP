import type { Metadata } from "next";
import { CertificatesPage } from "@/components/documents";

export const metadata: Metadata = {
  title: "Certificates",
};

export default function Page() {
  return <CertificatesPage />;
}
