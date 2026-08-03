import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Orders",
};

export default function Page() {
  redirect(ROUTES.ordersActive);
}
