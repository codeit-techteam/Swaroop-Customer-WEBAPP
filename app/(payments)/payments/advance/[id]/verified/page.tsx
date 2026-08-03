import type { Metadata } from "next";
import { AdvancePaymentVerifiedPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "Payment Verified",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdvancePaymentVerifiedPage paymentId={id} />;
}
