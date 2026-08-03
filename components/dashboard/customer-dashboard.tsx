"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDashboardStore } from "@/store/dashboardStore";
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
} from "@/components/dashboard";

export function CustomerDashboard() {
  const [ready, setReady] = useState(false);

  const hero = useDashboardStore((s) => s.hero);
  const marketPrices = useDashboardStore((s) => s.marketPrices);
  const marketPricesUpdatedAt = useDashboardStore(
    (s) => s.marketPricesUpdatedAt,
  );
  const creditSummary = useDashboardStore((s) => s.creditSummary);
  const outstanding = useDashboardStore((s) => s.outstanding);
  const purchaseRequests = useDashboardStore((s) => s.purchaseRequests);
  const recentActivity = useDashboardStore((s) => s.recentActivity);
  const categories = useDashboardStore((s) => s.categories);
  const recommendedProducts = useDashboardStore((s) => s.recommendedProducts);
  const promotion = useDashboardStore((s) => s.promotion);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 220);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {!ready ? (
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
          <HeroBanner content={hero} />

          {/* Mobile / tablet finance strip */}
          <div className="grid gap-4 sm:grid-cols-2 xl:hidden">
            <CreditCard credit={creditSummary} />
            <OutstandingCard outstanding={outstanding} />
          </div>

          <div className="grid items-start gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-5 lg:space-y-6">
              <MarketPricesSection
                prices={marketPrices}
                updatedAt={marketPricesUpdatedAt}
              />
              <ProcurementTable rows={purchaseRequests} />
              <RecommendedProducts products={recommendedProducts} />
            </div>

            <aside className="hidden space-y-4 xl:sticky xl:top-[4.5rem] xl:block xl:self-start">
              <CreditCard credit={creditSummary} />
              <OutstandingCard outstanding={outstanding} />
              <ActivityTimeline items={recentActivity} />
              <CategoriesGrid categories={categories} />
              <PromotionCard promotion={promotion} />
            </aside>
          </div>

          {/* Activity / categories / promo below main on < xl */}
          <div className="grid gap-4 md:grid-cols-2 xl:hidden">
            <ActivityTimeline items={recentActivity} />
            <div className="space-y-4">
              <CategoriesGrid categories={categories} />
              <PromotionCard promotion={promotion} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
