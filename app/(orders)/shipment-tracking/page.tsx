import type { Metadata } from "next";
import { TrackShipmentPage } from "@/components/shipment-tracking";

export const metadata: Metadata = {
  title: "Track Shipment",
};

export default function Page() {
  return <TrackShipmentPage />;
}
