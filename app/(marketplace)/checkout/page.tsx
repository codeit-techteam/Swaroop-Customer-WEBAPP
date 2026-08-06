import type { Metadata } from "next";
import { CheckoutPage } from "@/components/cart";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function Page() {
  return <CheckoutPage />;
}
