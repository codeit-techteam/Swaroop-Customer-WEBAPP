"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeftRight } from "lucide-react";
import { ROUTES } from "@/constants";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MarketplaceProduct } from "@/types/marketplace";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: MarketplaceProduct;
  index?: number;
  variant?: "grid" | "list";
  onQuickView?: (productId: string) => void;
  className?: string;
}

function stockBadgeLabel(status: MarketplaceProduct["stockStatus"]): string {
  if (status === "in_stock") return "IN STOCK";
  if (status === "limited") return "LIMITED";
  return "OUT OF STOCK";
}

function regionLabel(_product: MarketplaceProduct): string {
  return "Western India Region";
}

export function ProductCard({
  product,
  index = 0,
  variant = "grid",
  onQuickView,
  className,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const productHref = `${ROUTES.marketplaceProduct}/${product.id}`;
  const cartHref = productHref;

  if (variant === "list") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 * index, duration: 0.3 }}
        className={cn(
          "group flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card transition-shadow hover:shadow-elevated sm:flex-row sm:items-stretch",
          className,
        )}
      >
        <Link
          href={productHref}
          className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:aspect-square sm:w-40"
        >
          <ProductImage
            product={product}
            imageFailed={imageFailed}
            onError={() => setImageFailed(true)}
          />
          <StockBadge status={product.stockStatus} />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={productHref}>
                  <h3 className="truncate text-base font-semibold text-slate-900 hover:text-brand">
                    {product.name}
                  </h3>
                </Link>
                <BrandPill label="PetroTrade Network" />
              </div>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {product.materialType}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                {product.description}
              </p>
            </div>
            <IconAction
              label="Quick view"
              onClick={() => onQuickView?.(product.id)}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </IconAction>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Price Per MT
              </p>
              <p className="text-xl font-bold tabular-nums text-brand">
                {formatInr(product.price)}
              </p>
              <div className="mt-1 flex gap-4 text-xs text-slate-500">
                <span>
                  <span className="font-semibold text-slate-400">
                    Location:
                  </span>{" "}
                  {regionLabel(product)}
                </span>
                <span>
                  <span className="font-semibold text-slate-400">
                    Min. Order:
                  </span>{" "}
                  {formatQuantityMt(product.moq)}
                </span>
              </div>
            </div>
            <Button
              asChild
              className="h-10 rounded-xl bg-brand px-4 text-sm font-semibold hover:bg-brand-700"
            >
              <Link href={cartHref}>
                Buy Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card transition-shadow hover:shadow-elevated",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Link href={productHref} className="absolute inset-0 block">
          <ProductImage
            product={product}
            imageFailed={imageFailed}
            onError={() => setImageFailed(true)}
          />
        </Link>
        <StockBadge status={product.stockStatus} />
        <div className="absolute right-3 top-3">
          <IconAction
            label="Quick view"
            onClick={() => onQuickView?.(product.id)}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </IconAction>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={productHref} className="min-w-0">
              <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-brand">
                {product.name}
              </h3>
            </Link>
            <BrandPill label="Verified Partner" />
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {product.materialType}
          </p>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {product.description}
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Price Per MT
            </p>
            <p className="text-lg font-bold tabular-nums text-brand">
              {formatInr(product.price)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[11px]">
            <div>
              <p className="font-semibold uppercase tracking-wide text-slate-400">
                Location
              </p>
              <p className="mt-0.5 font-medium text-slate-700">
                {regionLabel(product)}
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-slate-400">
                Min. Order
              </p>
              <p className="mt-0.5 font-medium text-slate-700">
                {formatQuantityMt(product.moq)}
              </p>
            </div>
          </div>

          <Button
            asChild
            className="h-10 w-full rounded-xl bg-brand text-xs font-semibold hover:bg-brand-700"
          >
            <Link href={cartHref}>
              Buy Now
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

function ProductImage({
  product,
  imageFailed,
  onError,
}: {
  product: MarketplaceProduct;
  imageFailed: boolean;
  onError: () => void;
}) {
  if (imageFailed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
        <span className="text-2xl font-bold text-brand/40">
          {product.grade.slice(0, 3)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={product.image}
      alt={product.name}
      fill
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 280px"
      onError={onError}
    />
  );
}

function StockBadge({ status }: { status: MarketplaceProduct["stockStatus"] }) {
  return (
    <Badge
      variant="success"
      className={cn(
        "absolute left-3 top-3 z-10 rounded-md border-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm",
        status === "limited" && "bg-amber-50 text-amber-700",
        status === "out_of_stock" && "bg-red-50 text-red-600",
      )}
    >
      {stockBadgeLabel(status)}
    </Badge>
  );
}

function BrandPill({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
      {label}
    </span>
  );
}

function IconAction({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.();
      }}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm transition-colors hover:text-brand"
      aria-label={label}
    >
      {children}
    </button>
  );
}
