"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import type { RecommendedProduct } from "@/types/dashboard";
import { ROUTES } from "@/constants";
import { formatInrPerMt } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: RecommendedProduct;
  index?: number;
  className?: string;
}

export function DashboardProductCard({
  product,
  index = 0,
  className,
}: ProductCardProps) {
  const stockLabel =
    product.stockStatus === "in_stock"
      ? "IN STOCK"
      : product.stockStatus === "limited"
        ? "LIMITED"
        : "OUT OF STOCK";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.35 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card transition-shadow hover:shadow-elevated",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-brand">
            {product.grade.slice(0, 4).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
              {product.name}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-slate-400">
              {product.grade}
            </p>
          </div>
        </div>
        <Badge
          variant="success"
          className={cn(
            "rounded-md border-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            product.stockStatus === "limited" && "bg-amber-50 text-amber-700",
            product.stockStatus === "out_of_stock" && "bg-red-50 text-red-600",
          )}
        >
          {stockLabel}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
        {product.description}
      </p>

      <div className="mt-auto space-y-3 border-t border-slate-100 pt-3">
        <p className="text-lg font-bold tabular-nums text-brand">
          {formatInrPerMt(product.priceInr)}
        </p>
        <p className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <Lock className="h-3 w-3" aria-hidden />
          Seller Identity Protected
        </p>
        <Button
          asChild
          size="sm"
          className="h-9 w-full rounded-xl bg-brand text-xs font-semibold hover:bg-brand-700"
        >
          <Link href={`${ROUTES.marketplaceProduct}/${product.id}`}>
            View Grade
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}
