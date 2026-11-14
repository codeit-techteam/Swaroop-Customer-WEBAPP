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
  const onlyBlind =
    brands.length > 0 &&
    brands.every(
      (b) =>
        b.name?.toUpperCase() === "PRIVATE" ||
        b.id === "private" ||
        b.shortName === "PVT",
    );

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-900">
        Supplier identity
      </legend>
      {onlyBlind ? (
        <p className="text-xs leading-relaxed text-slate-500">
          Blind marketplace policy: manufacturer / brand identity is shown as{" "}
          <span className="font-semibold text-slate-700">PRIVATE</span> on all
          customer listings. Use material or warehouse filters instead.
        </p>
      ) : null}
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
                disabled={onlyBlind}
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
