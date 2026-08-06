import type { Metadata } from "next";
import { RequestCreditPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "Request Credit",
};

export default function Page() {
  return <RequestCreditPage />;
}
