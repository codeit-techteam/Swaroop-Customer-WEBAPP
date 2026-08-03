import type { Metadata } from "next";
import { AdvancePaymentSuccessPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "Payment Submitted",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdvancePaymentSuccessPage paymentId={id} />;
}
