"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants";
import type { MarketplaceCategory } from "@/types/marketplace";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: MarketplaceCategory;
  index?: number;
  className?: string;
}

export function CategoryCard({
  category,
  index = 0,
  className,
}: CategoryCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const href = `${ROUTES.marketplaceCategory}/${category.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link
        href={href}
        className={cn(
          "group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card transition-shadow hover:shadow-elevated",
          className,
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          {!imageFailed ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 320px"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
              <span className="text-xl font-bold text-brand/40">
                {category.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {category.name}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              {category.productCount}{" "}
              {category.productCount === 1 ? "grade" : "grades"}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-brand group-hover:text-white">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
