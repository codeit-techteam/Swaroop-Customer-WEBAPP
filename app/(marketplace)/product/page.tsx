import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Product",
};

/** Legacy `/product` → marketplace catalog. */
export default function LegacyProductIndexPage() {
  redirect(ROUTES.marketplace);
}
