"use client";

import { formatInr } from "@/lib/format";
import type { BulkPricingTier } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface BulkPricingCardProps {
  tiers: BulkPricingTier[];
  className?: string;
}

export function BulkPricingCard({ tiers, className }: BulkPricingCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-slate-900">
        Bulk Pricing Tiers
      </h3>
      <div className="mt-3 divide-y divide-slate-100">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <span className="text-sm font-medium text-slate-600">
              {tier.quantityLabel}
            </span>
            <span className="text-sm font-bold tabular-nums text-brand">
              {formatInr(tier.pricePerMt, { compact: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
