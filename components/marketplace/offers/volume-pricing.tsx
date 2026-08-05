"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatInr, formatInrPerMt } from "@/lib/format";
import { getBestValueTier, getStartingBulkPrice } from "@/lib/offer-utils";
import type { MarketplaceOffer } from "@/types/offers";
import { cn } from "@/lib/utils";

interface VolumePricingProps {
  offer: MarketplaceOffer;
  quantityMt?: number;
  compact?: boolean;
  className?: string;
}

export function VolumePricing({
  offer,
  quantityMt,
  compact = false,
  className,
}: VolumePricingProps) {
  const [expanded, setExpanded] = useState(false);
  const tiers = offer.bulkTiers;

  if (!tiers?.length) return null;

  const startingPrice = getStartingBulkPrice(offer);
  const bestTier = getBestValueTier(offer);
  const activeTier = quantityMt
    ? [...tiers]
        .sort((a, b) => b.minMt - a.minMt)
        .find((t) => quantityMt >= t.minMt)
    : null;

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            Starting{" "}
            <span className="font-semibold text-brand">
              {startingPrice ? formatInrPerMt(startingPrice) : "—"}
            </span>
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 rounded-lg px-2 text-xs text-brand"
            onClick={() => setExpanded((v) => !v)}
          >
            <Layers3 className="h-3.5 w-3.5" />
            View Volume Pricing
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
        {expanded ? (
          <TierList
            tiers={tiers}
            bestTierId={bestTier?.id}
            activeTierId={activeTier?.id}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Layers3 className="h-4 w-4 text-brand" />
        <h4 className="text-sm font-semibold text-slate-900">Volume Pricing</h4>
      </div>
      <TierList
        tiers={tiers}
        bestTierId={bestTier?.id}
        activeTierId={activeTier?.id}
      />
    </div>
  );
}

function TierList({
  tiers,
  bestTierId,
  activeTierId,
}: {
  tiers: NonNullable<MarketplaceOffer["bulkTiers"]>;
  bestTierId?: string;
  activeTierId?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {tiers.map((tier, index) => {
        const nextTier = tiers[index + 1];
        const rangeLabel = nextTier
          ? `${tier.minMt}–${nextTier.minMt - 1} MT`
          : `${tier.minMt}+ MT`;
        const isBest = tier.id === bestTierId;
        const isActive = tier.id === activeTierId;

        return (
          <div
            key={tier.id}
            className={cn(
              "relative rounded-xl border p-3 transition",
              isActive
                ? "border-brand bg-brand/5"
                : "border-slate-200 bg-slate-50/80",
            )}
          >
            {isBest ? (
              <span className="absolute -top-2 right-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                Best Value
              </span>
            ) : null}
            <p className="text-xs font-semibold text-slate-600">{rangeLabel}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
              {formatInr(tier.discountPrice, { compact: true })}
              <span className="ml-1 text-xs font-medium text-slate-400">
                / MT
              </span>
            </p>
            <p className="mt-0.5 text-xs text-emerald-700">
              Save {formatInr(tier.savings, { compact: true })} / MT
            </p>
          </div>
        );
      })}
    </div>
  );
}
