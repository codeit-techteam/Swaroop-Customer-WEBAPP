import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Purchase Requests",
};

/** Purchase Requests hub → Active Requests (tracking only). */
export default function Page() {
  redirect(ROUTES.purchaseRequestsActive);
}
