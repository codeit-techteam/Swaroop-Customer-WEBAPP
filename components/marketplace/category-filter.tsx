"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type {
  MarketplaceCategory,
  MarketplaceParentCategoryId,
} from "@/types/marketplace";

interface CategoryFilterProps {
  categories: MarketplaceCategory[];
  selected: MarketplaceParentCategoryId[];
  onToggle: (categoryId: MarketplaceParentCategoryId) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onToggle,
}: CategoryFilterProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-900">
        Categories
      </legend>
      <div className="space-y-2.5">
        {categories.map((category) => {
          const checked = selected.includes(category.id);
          const inputId = `filter-category-${category.id}`;
          return (
            <div key={category.id} className="flex items-center gap-2.5">
              <Checkbox
                id={inputId}
                checked={checked}
                onCheckedChange={() => onToggle(category.id)}
              />
              <Label
                htmlFor={inputId}
                className="cursor-pointer text-sm font-medium text-slate-600"
              >
                {category.name}
              </Label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
