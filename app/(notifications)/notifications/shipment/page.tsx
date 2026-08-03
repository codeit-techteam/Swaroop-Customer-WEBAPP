import type { Metadata } from "next";
import { ShipmentNotificationsPage } from "@/components/shipment-tracking";

export const metadata: Metadata = {
  title: "Shipment Notifications",
};

export default function Page() {
  return <ShipmentNotificationsPage />;
}
