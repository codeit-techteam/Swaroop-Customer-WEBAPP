"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/constants";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import { CategoryCard } from "./category-card";
import { MarketplaceEmptyState } from "./empty-state";

export function MarketplaceCategoriesPage() {
  const categories = useMarketplaceStore((s) => s.categories);
  const products = useMarketplaceStore((s) => s.products);

  const enriched = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        productCount: products.filter((p) => p.categoryId === category.id)
          .length,
      })),
    [categories, products],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Categories"
        description="Browse industrial material categories and open a filtered catalog."
        breadcrumbs={[
          { label: "Marketplace", href: ROUTES.marketplace },
          { label: "Categories" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {enriched.length === 0 ? (
          <MarketplaceEmptyState title="No categories available" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {enriched.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
