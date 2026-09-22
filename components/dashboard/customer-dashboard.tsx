"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import {
  ActivityTimeline,
  CategoriesGrid,
  CreditCard,
  DashboardSkeleton,
  HeroBanner,
  MarketPricesSection,
  OutstandingCard,
  ProcurementTable,
  PromotionCard,
  RecommendedProducts,
  PopularMaterials,
} from "@/components/dashboard";
import { PromoBannerSlider } from "@/components/cms/promo-banner-slider";
import { MarketplaceEmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";

export function CustomerDashboard() {
  const hero = useDashboardStore((s) => s.hero);
  const marketPrices = useDashboardStore((s) => s.marketPrices);
  const creditSummary = useDashboardStore((s) => s.creditSummary);
  const outstanding = useDashboardStore((s) => s.outstanding);
  const purchaseRequests = useDashboardStore((s) => s.purchaseRequests);
  const recentActivity = useDashboardStore((s) => s.recentActivity);
  const categories = useDashboardStore((s) => s.categories);
  const recommendedProducts = useDashboardStore((s) => s.recommendedProducts);
  const promotion = useDashboardStore((s) => s.promotion);
  const hydrateFromCatalog = useDashboardStore((s) => s.hydrateFromCatalog);

  const catalogLoading = useMarketplaceStore((s) => s.isLoading);
  const catalogHasLoaded = useMarketplaceStore((s) => s.hasLoaded);
  const catalogError = useMarketplaceStore((s) => s.loadError);
  const products = useMarketplaceStore((s) => s.products);
  const fetchCatalog = useMarketplaceStore((s) => s.fetchCatalog);

  useEffect(() => {
    if (!catalogHasLoaded && !catalogLoading) {
      void fetchCatalog();
    }
  }, [catalogHasLoaded, catalogLoading, fetchCatalog]);

  useEffect(() => {
    if (catalogHasLoaded) {
      hydrateFromCatalog();
    }
  }, [catalogHasLoaded, products, hydrateFromCatalog]);

  const showSkeleton = !catalogHasLoaded || catalogLoading;

  if (catalogHasLoaded && catalogError && products.length === 0) {
    return (
      <PageContainer>
        <MarketplaceEmptyState
          title="Unable to load dashboard catalog"
          description={catalogError}
          action={
            <Button onClick={() => void fetchCatalog()}>Retry</Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showSkeleton ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DashboardSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mx-auto max-w-[1440px] space-y-5 lg:space-y-6"
        >
          <PromoBannerSlider
            placement="HOME_HERO"
            fallback={<HeroBanner content={hero} />}
          />

          {/* Mobile / tablet finance strip */}
          <div className="grid gap-4 sm:grid-cols-2 xl:hidden">
            <CreditCard credit={creditSummary} />
            <OutstandingCard outstanding={outstanding} />
          </div>

          <div className="grid items-start gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-5 lg:space-y-6">
              <MarketPricesSection prices={marketPrices} />
              <PopularMaterials />
              <ProcurementTable rows={purchaseRequests} />
              <RecommendedProducts products={recommendedProducts} />
            </div>

            <aside className="hidden space-y-4 xl:sticky xl:top-[4.5rem] xl:block xl:self-start">
              <CreditCard credit={creditSummary} />
              <OutstandingCard outstanding={outstanding} />
              <ActivityTimeline items={recentActivity} />
              <CategoriesGrid categories={categories} />
              {promotion ? <PromotionCard promotion={promotion} /> : null}
            </aside>
          </div>

          {/* Activity / categories / promo below main on < xl */}
          <div className="grid gap-4 md:grid-cols-2 xl:hidden">
            <ActivityTimeline items={recentActivity} />
            <div className="space-y-4">
              <CategoriesGrid categories={categories} />
              {promotion ? <PromotionCard promotion={promotion} /> : null}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
