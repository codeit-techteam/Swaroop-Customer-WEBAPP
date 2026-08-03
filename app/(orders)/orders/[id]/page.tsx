import type { Metadata } from "next";
import { CatalogOrderDetailPage } from "@/components/orders";

export const metadata: Metadata = {
  title: "Order Details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <CatalogOrderDetailPage orderId={id} />;
}
