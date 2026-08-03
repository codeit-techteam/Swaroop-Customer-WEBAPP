import type { Metadata } from "next";
import { ShipmentDetailsPage } from "@/components/shipment-tracking";

export const metadata: Metadata = {
  title: "Shipment Details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ShipmentDetailsPage shipmentId={id} />;
}
