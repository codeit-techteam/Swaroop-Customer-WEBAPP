"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
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
  const [imageFailed, setImageFailed] = useState(false);

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
        "group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card transition-shadow hover:shadow-elevated",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {!imageFailed ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 280px"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
            <span className="text-2xl font-bold text-brand/40">
              {product.grade.slice(0, 3)}
            </span>
          </div>
        )}
        <Badge
          variant="success"
          className={cn(
            "absolute left-3 top-3 rounded-md border-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm",
            product.stockStatus === "limited" && "bg-amber-50 text-amber-700",
            product.stockStatus === "out_of_stock" && "bg-red-50 text-red-600",
          )}
        >
          {stockLabel}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-slate-400">
            Grade {product.grade}
          </p>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {product.description}
          </p>
        </div>

        <div className="mt-auto space-y-3 border-t border-slate-100 pt-3">
          <p className="text-lg font-bold tabular-nums text-brand">
            {formatInrPerMt(product.priceInr)}
          </p>
          <Button
            asChild
            size="sm"
            className="h-9 w-full rounded-xl bg-brand text-xs font-semibold hover:bg-brand-700"
          >
            <Link href={`${ROUTES.marketplaceProduct}/${product.id}`}>
              <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
              Add to Cart
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
