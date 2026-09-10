"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { formatInr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { RelatedProductCard } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface RelatedProductsCarouselProps {
  products: RelatedProductCard[];
  className?: string;
}

export function RelatedProductsCarousel({
  products,
  className,
}: RelatedProductsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scrollBy = (direction: -1 | 1) => {
    scrollerRef.current?.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  };

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Recommended Grades
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Similar materials by specification and commercial terms.
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll related grades left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={() => scrollBy(1)}
            aria-label="Scroll related grades right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="scrollbar-thin flex gap-4 overflow-x-auto pb-2"
      >
        {products.map((product, index) => (
          <motion.article
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index, duration: 0.3 }}
            whileHover={{ y: -3 }}
            className="w-[260px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-brand">
                {product.name.slice(0, 3).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {product.name}
                </p>
                <p className="text-xs text-slate-500">{product.categoryLabel}</p>
              </div>
            </div>
            <p className="mt-3 text-lg font-bold tabular-nums text-brand">
              {formatInr(product.pricePerMt)}
              <span className="ml-1 text-xs font-medium text-slate-400">
                / MT
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {product.stockLabel} · {product.warehouseLabel}
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <Lock className="h-3 w-3" aria-hidden />
              Seller protected
            </p>
            <Button
              asChild
              size="sm"
              className="mt-3 h-9 w-full rounded-xl bg-brand text-xs hover:bg-brand-700"
            >
              <Link href={product.href}>View Details</Link>
            </Button>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
