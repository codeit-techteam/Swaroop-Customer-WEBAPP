import type { Metadata } from "next";
import { PaymentIdRouter } from "@/components/payments";

export const metadata: Metadata = {
  title: "Payment Details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <PaymentIdRouter id={id} />;
}
