"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { MarketplaceBrand } from "@/types/marketplace";

interface BrandFilterProps {
  brands: MarketplaceBrand[];
  selected: string[];
  onToggle: (brandId: string) => void;
}

export function BrandFilter({ brands, selected, onToggle }: BrandFilterProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-900">Brands</legend>
      <div className="space-y-2.5">
        {brands.map((brand) => {
          const checked = selected.includes(brand.id);
          const inputId = `filter-brand-${brand.id}`;
          return (
            <div key={brand.id} className="flex items-center gap-2.5">
              <Checkbox
                id={inputId}
                checked={checked}
                onCheckedChange={() => onToggle(brand.id)}
              />
              <Label
                htmlFor={inputId}
                className="cursor-pointer text-sm font-medium text-slate-600"
              >
                {brand.name}
              </Label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
