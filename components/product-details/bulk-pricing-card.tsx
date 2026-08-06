"use client";

import { formatInr } from "@/lib/format";
import type { BulkPricingTier } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface BulkPricingCardProps {
  tiers: BulkPricingTier[];
  /** Quantity in MT — used to highlight the matching tier */
  quantity?: number;
  /** Called when the user selects a tier (sets qty to that tier's min) */
  onSelectTier?: (tier: BulkPricingTier) => void;
  className?: string;
}

function tierMatchesQuantity(tier: BulkPricingTier, quantity: number) {
  if (quantity < tier.minMt) return false;
  if (tier.maxMt == null) return true;
  return quantity <= tier.maxMt;
}

export function BulkPricingCard({
  tiers,
  quantity,
  onSelectTier,
  className,
}: BulkPricingCardProps) {
  const selectable = typeof onSelectTier === "function";
  const activeTierId =
    quantity != null
      ? tiers.find((tier) => tierMatchesQuantity(tier, quantity))?.id
      : undefined;

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">
          Bulk Pricing Tiers
        </h3>
        {selectable ? (
          <p className="text-[11px] font-medium text-slate-400">
            Select a tier
          </p>
        ) : null}
      </div>
      <div
        className="mt-3 divide-y divide-slate-100"
        role={selectable ? "radiogroup" : undefined}
        aria-label={selectable ? "Bulk pricing tiers" : undefined}
      >
        {tiers.map((tier) => {
          const selected = tier.id === activeTierId;
          const content = (
            <>
              {selectable ? (
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    selected
                      ? "border-brand bg-brand"
                      : "border-slate-300 bg-white",
                  )}
                  aria-hidden="true"
                >
                  {selected ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
              ) : null}
              <span className="min-w-0 flex-1 text-sm font-medium text-slate-600">
                {tier.quantityLabel}
              </span>
              <span className="text-sm font-bold tabular-nums text-brand">
                {formatInr(tier.pricePerMt, { compact: true })}
              </span>
            </>
          );

          if (!selectable) {
            return (
              <div
                key={tier.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                {content}
              </div>
            );
          }

          return (
            <button
              key={tier.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelectTier(tier)}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors first:mt-0",
                selected
                  ? "bg-brand/5 ring-1 ring-brand/25"
                  : "hover:bg-slate-50",
              )}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
