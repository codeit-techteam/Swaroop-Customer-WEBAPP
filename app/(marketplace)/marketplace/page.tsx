import { Suspense } from "react";
import { MarketplaceBrowse } from "@/components/marketplace";
import { ROUTES } from "@/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Marketplace",
  description:
    "Browse industrial petrochemical grades, filter catalog, and create purchase requests.",
  path: ROUTES.marketplace,
});

export default function MarketplacePage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceBrowse pageTitle="Marketplace" />
    </Suspense>
  );
}
