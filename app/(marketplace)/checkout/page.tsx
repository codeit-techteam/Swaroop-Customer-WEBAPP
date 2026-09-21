import type { Metadata } from "next";
import { CheckoutEntry } from "@/components/cart/buy-now-checkout";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function Page() {
  return <CheckoutEntry />;
}
