import type { Metadata } from "next";
import { CartPage } from "@/components/cart";

export const metadata: Metadata = {
  title: "Cart",
};

export default function Page() {
  return <CartPage />;
}
