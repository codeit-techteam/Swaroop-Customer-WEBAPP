import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/** Legacy route — Shipment Timeline screen removed. */
export default function Page() {
  redirect(ROUTES.shipmentTracking);
}
