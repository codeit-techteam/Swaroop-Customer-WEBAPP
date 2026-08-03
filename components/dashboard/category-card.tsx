"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Beaker,
  Droplets,
  FlaskConical,
  Layers,
  type LucideIcon,
} from "lucide-react";
import type {
  CategoryCardItem,
  MarketplaceCategoryId,
} from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: CategoryCardItem;
  index?: number;
  className?: string;
}

const CATEGORY_ICONS: Record<MarketplaceCategoryId, LucideIcon> = {
  polymers: Layers,
  chemicals: FlaskConical,
  liquids: Droplets,
  additives: Beaker,
};

const CATEGORY_TONES: Record<MarketplaceCategoryId, string> = {
  polymers: "bg-sky-50 text-sky-700 group-hover:bg-sky-100",
  chemicals: "bg-violet-50 text-violet-700 group-hover:bg-violet-100",
  liquids: "bg-cyan-50 text-cyan-700 group-hover:bg-cyan-100",
  additives: "bg-amber-50 text-amber-700 group-hover:bg-amber-100",
};

export function CategoryCard({
  category,
  index = 0,
  className,
}: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[category.id];
  const tone = CATEGORY_TONES[category.id];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={className}
    >
      <Link
        href={category.href}
        className={cn(
          "group flex flex-col items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-3 text-center shadow-sm transition-all hover:border-brand/20 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        )}
      >
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            tone,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-[11px] font-semibold leading-tight text-slate-700">
          {category.name}
        </span>
      </Link>
    </motion.div>
  );
}
