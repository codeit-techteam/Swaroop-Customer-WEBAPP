"use client";

import type { ReactNode } from "react";
import { Warehouse, CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProductDetailRecord } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface ProductHeaderProps {
  product: ProductDetailRecord;
  className?: string;
}

export function ProductHeader({ product, className }: ProductHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={cn(
            "rounded-md border-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            product.availability === "high" || product.availability === "medium"
              ? "bg-emerald-50 text-emerald-700"
              : product.availability === "limited"
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-600",
          )}
        >
          {product.availabilityLabel}
        </Badge>
        <span className="font-mono text-xs font-medium text-slate-400">
          {product.sku}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand md:text-3xl">
          {product.name}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoChip
          icon={<Warehouse className="h-3.5 w-3.5" />}
          label="Supply Partner"
          value="Verified by PetroTrade"
        />
        <InfoChip
          icon={<CircleDot className="h-3.5 w-3.5 text-emerald-600" />}
          label="Stock Status"
          value={product.stockLabel}
          valueClassName="text-emerald-700"
        />
      </div>

      <p className="text-sm leading-relaxed text-slate-600">
        {product.description}
      </p>
    </div>
  );
}

function InfoChip({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "mt-1 text-sm font-semibold text-slate-800",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}
