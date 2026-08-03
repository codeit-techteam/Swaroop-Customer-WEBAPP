import type { Metadata } from "next";
import { AdvancePaymentUploadPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "Upload Payment Proof",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdvancePaymentUploadPage paymentId={id} />;
}
