import type { Metadata } from "next";
import { CreatePurchaseRequestEntry } from "@/components/purchase-requests/create-purchase-request-entry";

export const metadata: Metadata = {
  title: "Create Purchase Request",
  description:
    "Select a marketplace grade or continue from your cart to place a purchase request.",
};

interface CreatePageProps {
  searchParams: Promise<{ productId?: string }>;
}

/**
 * B-02 / web parity: Create Purchase Request must not silently dump users onto
 * the marketplace grade list. With a productId, open that product for RFQ;
 * otherwise show a guided entry (cart → checkout, or pick a product).
 */
export default async function Page({ searchParams }: CreatePageProps) {
  const { productId } = await searchParams;
  return <CreatePurchaseRequestEntry productId={productId} />;
}
