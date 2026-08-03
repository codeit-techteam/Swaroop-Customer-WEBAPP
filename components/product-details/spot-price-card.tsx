"use client";

import { TrendingUp } from "lucide-react";
import { formatInr } from "@/lib/format";
import type { SpotPriceInfo } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface SpotPriceCardProps {
  spotPrice: SpotPriceInfo;
  className?: string;
}

export function SpotPriceCard({ spotPrice, className }: SpotPriceCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-brand/20 shadow-card",
        className,
      )}
    >
      <div className="bg-brand px-5 py-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
          Current Spot Price
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums">
          {formatInr(spotPrice.pricePerMt, { compact: true })}{" "}
          <span className="text-base font-semibold text-white/80">/ MT</span>
        </p>
        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-300">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />+
          {formatInr(spotPrice.yesterdayDelta, { compact: true })} from
          yesterday
        </p>
      </div>
    </div>
  );
}
