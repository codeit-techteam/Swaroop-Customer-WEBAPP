import type { Metadata } from "next";
import { MarketplaceBrowse } from "@/components/marketplace";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse industrial petrochemical grades, filter catalog, and create purchase requests.",
};

export default function MarketplacePage() {
  return <MarketplaceBrowse pageTitle="Marketplace" />;
}
