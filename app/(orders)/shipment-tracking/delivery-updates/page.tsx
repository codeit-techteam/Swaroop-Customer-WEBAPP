import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/** Legacy route — Delivery Updates screen removed. */
export default function Page() {
  redirect(ROUTES.shipmentTracking);
}
