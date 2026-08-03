"use client";

import type { RecommendedProduct } from "@/types/dashboard";
import { ROUTES } from "@/constants";
import { DashboardProductCard } from "@/components/dashboard/product-card";
import { SectionTitle } from "@/components/dashboard/section-title";
import { cn } from "@/lib/utils";

interface RecommendedProductsProps {
  products: RecommendedProduct[];
  className?: string;
}

export function RecommendedProducts({
  products,
  className,
}: RecommendedProductsProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <SectionTitle
        title="Recommended for Your Portfolio"
        actionLabel="Browse Marketplace"
        actionHref={ROUTES.marketplace}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => (
          <DashboardProductCard
            key={product.id}
            product={product}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
