"use client";

import type { MarketplaceProduct } from "@/types/marketplace";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

interface ProductListProps {
  products: MarketplaceProduct[];
  onQuickView?: (productId: string) => void;
  compareMode?: boolean;
  className?: string;
}

export function ProductList({
  products,
  onQuickView,
  compareMode = false,
  className,
}: ProductListProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          variant="list"
          onQuickView={onQuickView}
          compareMode={compareMode}
        />
      ))}
    </div>
  );
}
