"use client";

import type {
  MarketplaceCategory,
  MarketplaceParentCategoryId,
} from "@/types/marketplace";
import { cn } from "@/lib/utils";

interface MarketplaceCategoryChipsProps {
  categories: MarketplaceCategory[];
  activeCategoryId: MarketplaceParentCategoryId | null;
  onSelect: (categoryId: MarketplaceParentCategoryId | null) => void;
  className?: string;
}

export function MarketplaceCategoryChips({
  categories,
  activeCategoryId,
  onSelect,
  className,
}: MarketplaceCategoryChipsProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <CategoryChip
        label="All Materials"
        selected={!activeCategoryId}
        onClick={() => onSelect(null)}
      />
      {categories.map((category) => (
        <CategoryChip
          key={category.id}
          label={category.name}
          selected={activeCategoryId === category.id}
          onClick={() => onSelect(category.id)}
        />
      ))}
    </div>
  );
}

function CategoryChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
        selected
          ? "bg-brand text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:border-brand/30 hover:bg-brand/5",
      )}
    >
      {label}
    </button>
  );
}
