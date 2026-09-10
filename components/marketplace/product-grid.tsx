"use client";

import type { MarketplaceProduct } from "@/types/marketplace";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: MarketplaceProduct[];
  onQuickView?: (productId: string) => void;
  compareMode?: boolean;
  className?: string;
}

export function ProductGrid({
  products,
  onQuickView,
  compareMode = false,
  className,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          variant="grid"
          onQuickView={onQuickView}
          compareMode={compareMode}
        />
      ))}
    </div>
  );
}
