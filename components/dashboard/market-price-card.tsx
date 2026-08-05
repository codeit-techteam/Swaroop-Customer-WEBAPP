"use client";

import { motion } from "framer-motion";
import type { MarketPrice } from "@/types/dashboard";
import { formatInrPerMt } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MarketPriceCardProps {
  price: MarketPrice;
  index?: number;
  className?: string;
}

export function MarketPriceCard({
  price,
  index = 0,
  className,
}: MarketPriceCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/90 p-3.5 shadow-sm transition-shadow hover:border-slate-200 hover:shadow-card sm:p-4",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {price.label}
      </p>
      <p className="mt-1.5 text-base font-bold tabular-nums tracking-tight text-slate-900 sm:text-lg">
        {formatInrPerMt(price.priceInr)}
      </p>
    </motion.article>
  );
}
