"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
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
  if (status === "in_stock") return "In Stock";
  if (status === "limited") return "Limited Stock";
  return "Out of Stock";
}

function regionLabel(product: MarketplaceProduct): string {
  return product.origin || "Western India Region";
}

function specEntries(product: MarketplaceProduct) {
  const specs = product.technicalSpecs ?? {};
  const preferred = ["mfi", "iv", "density", "form", "purity", "viscosity"];
  const entries: { label: string; value: string }[] = [];

  for (const key of preferred) {
    const value = specs[key];
    if (value) {
      entries.push({
        label: key === "mfi" ? "MFI" : key === "iv" ? "IV" : key.charAt(0).toUpperCase() + key.slice(1),
        value,
      });
    }
  }

  if (entries.length < 2) {
    for (const [key, value] of Object.entries(specs)) {
      if (!value || preferred.includes(key)) continue;
      entries.push({
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value,
      });
      if (entries.length >= 4) break;
    }
  }

  return entries.slice(0, 4);
}

export function ProductCard({
  product,
  index = 0,
  variant = "list",
  onQuickView,
  className,
}: ProductCardProps) {
  const productHref = `${ROUTES.marketplaceProduct}/${product.id}`;
  const gradeCode = product.gradeCode ?? product.grade;
  const specs = specEntries(product);

  const content = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={productHref}>
              <h3 className="text-base font-semibold text-slate-900 hover:text-brand">
                {product.name}
              </h3>
            </Link>
            {product.verified !== false ? (
              <Badge className="rounded-md border-0 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 hover:bg-emerald-50">
                <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />
                Verified Supply
              </Badge>
            ) : null}
          </div>
          <p className="font-mono text-xs font-medium text-slate-400">
            {gradeCode}
          </p>
          <p className="text-sm text-slate-500">
            {product.materialType}
            {product.subCategory ? ` · ${product.subCategory}` : ""}
          </p>
        </div>

        {onQuickView ? (
          <div className="flex items-center gap-1.5">
            <IconAction
              label="Quick view"
              onClick={() => onQuickView(product.id)}
            >
              <ArrowRight className="h-4 w-4" />
            </IconAction>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 text-sm sm:grid-cols-4">
        {specs.map((spec) => (
          <div key={spec.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {spec.label}
            </p>
            <p className="mt-0.5 font-medium tabular-nums text-slate-800">
              {spec.value}
            </p>
          </div>
        ))}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Availability
          </p>
          <p className="mt-0.5 font-medium text-slate-800">
            {stockBadgeLabel(product.stockStatus)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            MOQ
          </p>
          <p className="mt-0.5 font-medium tabular-nums text-slate-800">
            {formatQuantityMt(product.moq)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Location
          </p>
          <p className="mt-0.5 font-medium text-slate-800">
            {regionLabel(product)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Delivery
          </p>
          <p className="mt-0.5 font-medium text-slate-800">{product.eta}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Price Per MT
          </p>
          <p className="text-xl font-bold tabular-nums text-brand">
            {formatInr(product.price)}
            <span className="ml-1 text-sm font-semibold text-slate-400">
              / MT
            </span>
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Lock className="h-3 w-3" aria-hidden />
            Seller Identity Protected
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-xl border-slate-200 px-4 text-sm font-semibold"
          >
            <Link href={productHref}>View Details</Link>
          </Button>
          <Button
            asChild
            className="h-10 rounded-xl bg-brand px-4 text-sm font-semibold hover:bg-brand-700"
          >
            <Link href={productHref}>
              Buy Now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );

  if (variant === "grid") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 * index, duration: 0.3 }}
        className={cn(
          "flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card transition-shadow hover:shadow-elevated",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <MaterialInitial grade={product.grade} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {product.grade}
            </p>
            <Link href={productHref}>
              <h3 className="truncate text-sm font-semibold text-slate-900 hover:text-brand">
                {product.name}
              </h3>
            </Link>
          </div>
        </div>
        {content}
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * index, duration: 0.28 }}
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card transition-shadow hover:shadow-elevated sm:p-5",
        className,
      )}
    >
      <div className="flex gap-4">
        <MaterialInitial grade={product.grade} className="hidden sm:flex" />
        <div className="flex min-w-0 flex-1 flex-col gap-4">{content}</div>
      </div>
    </motion.article>
  );
}

function MaterialInitial({
  grade,
  className,
}: {
  grade: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100",
        className,
      )}
      aria-hidden
    >
      <span className="text-sm font-bold tracking-tight text-brand">
        {grade.slice(0, 4).toUpperCase()}
      </span>
    </div>
  );
}

function IconAction({
  children,
  label,
  onClick,
  active,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand/30 hover:text-brand",
        active && "border-brand/40 bg-brand/5 text-brand",
      )}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
