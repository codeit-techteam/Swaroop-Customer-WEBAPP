"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FilePlus2 } from "lucide-react";
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
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {product ? (
          <>
            <SheetHeader className="space-y-1 text-left">
              <div className="pr-6">
                <SheetTitle className="text-xl">{product.name}</SheetTitle>
                <SheetDescription className="mt-1">
                  {product.brandName} · {product.materialType}
                </SheetDescription>
              </div>
            </SheetHeader>

            <div className="mt-5 space-y-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                {!imageFailed ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="400px"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl font-bold text-brand/40">
                    {product.grade}
                  </div>
                )}
                <Badge
                  className={cn(
                    "absolute left-3 top-3 border-0",
                    product.stockStatus === "limited" &&
                      "bg-amber-50 text-amber-700",
                  )}
                >
                  {product.stockStatus === "in_stock"
                    ? "IN STOCK"
                    : product.stockStatus === "limited"
                      ? "LIMITED"
                      : "OUT OF STOCK"}
                </Badge>
              </div>

              <p className="text-sm leading-relaxed text-slate-600">
                {product.description}
              </p>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Price Per MT
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-brand">
                  {formatInr(product.price)}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Warehouse
                    </p>
                    <p className="font-medium text-slate-700">
                      {product.warehouseLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Min. Order
                    </p>
                    <p className="font-medium text-slate-700">
                      {formatQuantityMt(product.moq)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Available Stock
                    </p>
                    <p className="font-medium text-slate-700">
                      {formatQuantityMt(product.stock)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Delivery
                    </p>
                    <p className="font-medium text-slate-700">{product.eta}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  className="h-11 rounded-xl bg-brand font-semibold hover:bg-brand-700"
                >
                  <Link
                    href={`${ROUTES.purchaseRequestsCreate}?productId=${product.id}`}
                  >
                    <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                    Create Purchase Request
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-xl">
                  <Link href={`${ROUTES.marketplaceProduct}/${product.id}`}>
                    View Details
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
