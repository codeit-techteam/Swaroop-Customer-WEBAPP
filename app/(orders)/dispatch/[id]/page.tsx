import type { Metadata } from "next";
import { DispatchDetailPage } from "@/components/dispatch";

export const metadata: Metadata = {
  title: "Dispatch",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <DispatchDetailPage orderId={id} />;
}
