import type { Metadata } from "next";
import { AdvancePaymentTrackerPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "Payment Tracker",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdvancePaymentTrackerPage paymentId={id} />;
}
