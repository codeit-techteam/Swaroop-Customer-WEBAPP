"use client";

import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatInr } from "@/lib/format";
import type { SpotPriceInfo } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface SpotPriceCardProps {
  spotPrice: SpotPriceInfo;
  /** Rendered top-right of the header (e.g. availability chip) */
  badge?: ReactNode;
  className?: string;
}

export function SpotPriceCard({
  spotPrice,
  badge,
  className,
}: SpotPriceCardProps) {
  const delta = spotPrice.yesterdayDelta;
  const falling = delta < 0;
  const TrendIcon = falling ? TrendingDown : TrendingUp;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-brand/20 shadow-card",
        className,
      )}
    >
      <div className="relative bg-brand px-4 py-3.5 text-white">
        <div
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/[0.06]"
          aria-hidden="true"
        />
        <div className="relative flex items-start justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
            Current Spot Price
          </p>
          {badge}
        </div>
        <p className="relative mt-1 text-[1.65rem] font-bold tabular-nums leading-tight">
          {formatInr(spotPrice.pricePerMt, { compact: true })}{" "}
          <span className="text-sm font-semibold text-white/75">/ MT</span>
        </p>
        {delta !== 0 ? (
          <p
            className={cn(
              "relative mt-1 flex items-center gap-1 text-xs font-medium",
              falling ? "text-rose-300" : "text-emerald-300",
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {falling ? "−" : "+"}
            {formatInr(Math.abs(delta), { compact: true })} from yesterday
          </p>
        ) : null}
      </div>
    </div>
  );
}
