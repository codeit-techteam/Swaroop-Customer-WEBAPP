import type { Metadata } from "next";
import { CheckoutSuccessEntry } from "@/components/checkout/success-entry";

export const metadata: Metadata = {
  title: "Purchase Request Submitted",
};

export default function Page() {
  return <CheckoutSuccessEntry />;
}
