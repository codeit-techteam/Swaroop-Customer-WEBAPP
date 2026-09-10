"use client";

import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { ROUTES } from "@/constants";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { MarketplaceProduct } from "@/types/marketplace";
import { BlindSellerBadge } from "./blind-seller-badge";
import { cn } from "@/lib/utils";

interface QuickViewDrawerProps {
  product: MarketplaceProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewDrawer({
  product,
  open,
  onOpenChange,
}: QuickViewDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {product ? (
          <>
            <SheetHeader className="space-y-1 text-left">
              <div className="pr-6">
                <SheetTitle className="text-xl">{product.name}</SheetTitle>
                <SheetDescription className="mt-1">
                  {product.gradeCode ?? product.grade} · {product.materialType}
                  {product.subCategory ? ` · ${product.subCategory}` : ""}
                </SheetDescription>
              </div>
            </SheetHeader>

            <div className="mt-5 space-y-5">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-brand">
                  {product.grade.slice(0, 4).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <Badge
                    className={cn(
                      "border-0",
                      product.stockStatus === "limited" &&
                        "bg-amber-50 text-amber-700",
                      product.stockStatus === "out_of_stock" &&
                        "bg-red-50 text-red-600",
                    )}
                  >
                    {product.stockStatus === "in_stock"
                      ? "IN STOCK"
                      : product.stockStatus === "limited"
                        ? "LIMITED"
                        : "OUT OF STOCK"}
                  </Badge>
                  <BlindSellerBadge compact />
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-600">
                {product.description}
              </p>

              {product.technicalSpecs ? (
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-sm">
                  {Object.entries(product.technicalSpecs)
                    .filter(([, value]) => Boolean(value))
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <div key={key}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          {key === "mfi"
                            ? "MFI"
                            : key.replace(/_/g, " ").toUpperCase()}
                        </p>
                        <p className="mt-0.5 font-medium text-slate-800">
                          {value}
                        </p>
                      </div>
                    ))}
                </div>
              ) : null}

              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Price Per MT
                </p>
                <p className="text-2xl font-bold tabular-nums text-brand">
                  {formatInr(product.price)}
                </p>
                <p className="text-xs text-slate-500">
                  MOQ {formatQuantityMt(product.moq)} · {product.origin} ·{" "}
                  {product.eta}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button asChild className="h-11 rounded-xl bg-brand hover:bg-brand-700">
                  <Link href={`${ROUTES.marketplaceProduct}/${product.id}`}>
                    <ShoppingCart className="h-4 w-4" />
                    Buy Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-xl">
                  <Link href={`${ROUTES.marketplaceProduct}/${product.id}`}>
                    View Full Specifications
                  </Link>
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
