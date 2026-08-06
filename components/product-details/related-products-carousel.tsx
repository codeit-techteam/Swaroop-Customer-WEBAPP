"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

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
            Recommended for Your Portfolio
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Based on similar grades in your catalog browsing history.
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll related products left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={() => scrollBy(1)}
            aria-label="Scroll related products right"
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
            className="w-[260px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
          >
            <div className="relative aspect-[16/10] bg-slate-100">
              {!failedImages[product.id] ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="260px"
                  onError={() =>
                    setFailedImages((prev) => ({
                      ...prev,
                      [product.id]: true,
                    }))
                  }
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-bold text-brand/30">
                  {product.categoryLabel.slice(0, 4)}
                </div>
              )}
              <span className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-sm">
                {product.categoryLabel}
              </span>
            </div>
            <div className="space-y-2 p-3.5">
              <p className="text-base font-bold tabular-nums text-brand">
                {formatInr(product.pricePerMt, { compact: true })} / MT
              </p>
              <div>
                <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Verified Supply Partner
                </p>
              </div>
              <p className="text-xs text-slate-500">
                {product.warehouseLabel} · {product.stockLabel}
              </p>
              <Button
                asChild
                variant="outline"
                className="h-9 w-full rounded-xl text-xs font-semibold"
              >
                <Link href={product.href}>View Grade</Link>
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
