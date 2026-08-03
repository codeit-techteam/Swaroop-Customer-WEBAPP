import type { Metadata } from "next";
import { MarketplaceOffersPage } from "@/components/marketplace/offers";

export const metadata: Metadata = {
  title: "Marketplace Offers",
  description:
    "Explore exclusive deals, bulk discounts, seasonal campaigns and credit offers.",
};

export default function MarketplaceOffersRoute() {
  return <MarketplaceOffersPage />;
}
