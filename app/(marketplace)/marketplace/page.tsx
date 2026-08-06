import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketplaceBrowse } from "@/components/marketplace";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse industrial petrochemical grades, filter catalog, and create purchase requests.",
};

export default function MarketplacePage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceBrowse pageTitle="Marketplace" />
    </Suspense>
  );
}
