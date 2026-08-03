import type { Metadata } from "next";
import { MarketplaceCategoriesPage } from "@/components/marketplace";

export const metadata: Metadata = {
  title: "Categories | Marketplace",
  description: "Browse marketplace material categories.",
};

export default function MarketplaceCategoriesRoute() {
  return <MarketplaceCategoriesPage />;
}
