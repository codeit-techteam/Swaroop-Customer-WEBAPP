import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Add to Cart",
};

interface CreatePageProps {
  searchParams: Promise<{ productId?: string }>;
}

/**
 * Legacy Create Purchase Request route.
 * Blind marketplace flow: Product Details → Add to Cart → Cart → Checkout.
 */
export default async function Page({ searchParams }: CreatePageProps) {
  const { productId } = await searchParams;
  if (productId) {
    redirect(`${ROUTES.marketplaceProduct}/${productId}`);
  }
  redirect(ROUTES.marketplace);
}
