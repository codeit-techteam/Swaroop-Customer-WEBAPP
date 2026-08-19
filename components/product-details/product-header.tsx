"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { ProductDetailRecord } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface ProductHeaderProps {
  product: ProductDetailRecord;
  className?: string;
}

const DESCRIPTION_PREVIEW_CHARS = 180;

export function ProductHeader({ product, className }: ProductHeaderProps) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = product.description.length > DESCRIPTION_PREVIEW_CHARS;
  const description =
    !needsTruncate || expanded
      ? product.description
      : `${product.description.slice(0, DESCRIPTION_PREVIEW_CHARS).trimEnd()}…`;

  return (
    <div className={cn("space-y-3", className)}>
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
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
          {product.grade}
        </span>
        <span className="font-mono text-xs font-medium text-slate-400">
          {product.sku}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand md:text-[1.75rem] md:leading-tight">
          {product.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {product.materialType} · {product.brandName}
        </p>
      </div>

      <div>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
        {needsTruncate ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-1 text-sm font-semibold text-brand hover:underline"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
