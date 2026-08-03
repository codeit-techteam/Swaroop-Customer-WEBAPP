import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Shipment Tracking",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Legacy /shipment/[id] → enterprise Track Shipment details */
export default async function Page({ params }: PageProps) {
  const { id } = await params;
  redirect(`${ROUTES.shipmentTracking}/${id}`);
}
