import type { Metadata } from "next";
import { AdvancePaymentBankPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "Payment Instructions",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdvancePaymentBankPage paymentId={id} />;
}
