"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PromotionOffer } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PromotionCardProps {
  promotion: PromotionOffer;
  className?: string;
}

export function PromotionCard({ promotion, className }: PromotionCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12 }}
      className={cn(
        "flex flex-col justify-between rounded-2xl bg-brand p-5 text-white shadow-elevated sm:p-6",
        className,
      )}
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
          {promotion.badge}
        </p>
        <h3 className="mt-3 text-xl font-bold tracking-tight">
          {promotion.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          {promotion.description}
        </p>
      </div>
      <Button
        asChild
        className="mt-6 h-10 w-full rounded-xl bg-white font-semibold text-brand hover:bg-white/95"
      >
        <Link href={promotion.href}>{promotion.ctaLabel}</Link>
      </Button>
    </motion.article>
  );
}
