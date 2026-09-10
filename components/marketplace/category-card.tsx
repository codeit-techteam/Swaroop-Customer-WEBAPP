"use client";

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
  const href = `${ROUTES.marketplaceCategory}/${category.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.35 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <Link
        href={href}
        className={cn(
          "group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card transition-shadow hover:shadow-elevated",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-brand">
            {category.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {category.name}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {category.productCount} grades available
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-brand" />
      </Link>
    </motion.div>
  );
}
