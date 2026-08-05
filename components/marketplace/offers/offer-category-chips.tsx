"use client";

import type { OfferCategoryChip } from "@/types/offers";
import { cn } from "@/lib/utils";

const CHIPS: { id: OfferCategoryChip; label: string }[] = [
  { id: "all", label: "All Offers" },
  { id: "polymers", label: "Polymers" },
  { id: "chemicals", label: "Chemicals" },
  { id: "additives", label: "Additives" },
  { id: "base-oils", label: "Base Oils" },
  { id: "bulk_deals", label: "Bulk Deals" },
  { id: "limited_time", label: "Limited Time" },
  { id: "credit_eligible", label: "Credit Eligible" },
];

interface OfferCategoryChipsProps {
  active: OfferCategoryChip;
  onChange: (chip: OfferCategoryChip) => void;
  className?: string;
}

export function OfferCategoryChips({
  active,
  onChange,
  className,
}: OfferCategoryChipsProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {CHIPS.map((chip) => {
        const selected = active === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
              selected
                ? "bg-brand text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:border-brand/30 hover:bg-brand/5",
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
