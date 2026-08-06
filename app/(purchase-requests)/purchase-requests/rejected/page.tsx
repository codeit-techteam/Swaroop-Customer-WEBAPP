import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { purchaseRequestsFiltered } from "@/constants";

export const metadata: Metadata = {
  title: "Purchase Requests",
};

export default function Page() {
  redirect(purchaseRequestsFiltered("rejected"));
}
