"use client";

import Image from "next/image";
import { Package, Warehouse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatInr, formatInrPerMt, formatQuantityMt } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SelectedProduct } from "@/types/purchase-request";

interface ProductSummaryProps {
  product: SelectedProduct;
  quantityMt?: number;
  className?: string;
  compact?: boolean;
}

export function ProductSummary({
  product,
  quantityMt,
  className,
  compact = false,
}: ProductSummaryProps) {
  return (
    <Card className={cn("border-slate-200", className)}>
      <CardHeader className={cn(compact ? "p-4 pb-2" : "pb-3")}>
        <CardTitle className="text-base">Selected Product</CardTitle>
      </CardHeader>
      <CardContent className={cn(compact ? "p-4 pt-0" : "pt-0")}>
        <div className="flex gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h3 className="truncate text-base font-semibold text-slate-900">
                {product.name}
              </h3>
              <p className="text-sm text-slate-500">
                {product.materialType} · Grade {product.grade}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="font-normal">
                Verified Supply Partner
              </Badge>
              <Badge variant="outline" className="gap-1 font-normal">
                <Warehouse className="h-3 w-3" aria-hidden />
                {product.warehouseRegion || "Western India Region"}
              </Badge>
            </div>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Available Stock
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {formatQuantityMt(product.availableStock)}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              MOQ
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {formatQuantityMt(product.moq)}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Current Price
            </dt>
            <dd className="mt-1 text-sm font-semibold text-brand">
              {formatInrPerMt(product.currentPricePerMt)}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {quantityMt != null ? "Quantity" : "Packaging"}
            </dt>
            <dd className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-900">
              {quantityMt != null ? (
                formatQuantityMt(quantityMt)
              ) : (
                <>
                  <Package className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  {product.packaging}
                </>
              )}
            </dd>
          </div>
        </dl>

        {quantityMt != null ? (
          <p className="mt-3 text-xs text-slate-500">
            Line estimate{" "}
            <span className="font-semibold text-slate-700">
              {formatInr(product.currentPricePerMt * quantityMt, {
                compact: true,
              })}
            </span>{" "}
            before GST & freight
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
