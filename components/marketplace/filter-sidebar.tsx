"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CategoryFilter } from "./category-filter";
import { BrandFilter } from "./brand-filter";
import { PriceSlider } from "./price-slider";
import { WarehouseFilter } from "./warehouse-filter";
import { CreditToggle } from "./credit-toggle";
import { FILTER_PANEL_SUBTITLE, FILTER_PANEL_TITLE } from "@/mock/filters";
import type {
  MarketplaceBrand,
  MarketplaceCategory,
  MarketplaceFiltersState,
  MarketplaceParentCategoryId,
  MarketplaceWarehouse,
  PriceRangeBounds,
} from "@/types/marketplace";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  categories: MarketplaceCategory[];
  brands: MarketplaceBrand[];
  warehouses: MarketplaceWarehouse[];
  draftFilters: MarketplaceFiltersState;
  priceBounds: PriceRangeBounds;
  onToggleCategory: (id: MarketplaceParentCategoryId) => void;
  onToggleBrand: (id: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onWarehouseChange: (id: string | null) => void;
  onCreditChange: (enabled: boolean) => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
}

export function FilterSidebar({
  categories,
  brands,
  warehouses,
  draftFilters,
  priceBounds,
  onToggleCategory,
  onToggleBrand,
  onPriceChange,
  onWarehouseChange,
  onCreditChange,
  onApply,
  onReset,
  className,
}: FilterSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-fit flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card",
        className,
      )}
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          {FILTER_PANEL_TITLE}
        </h2>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {FILTER_PANEL_SUBTITLE}
        </p>
      </div>

      <div className="space-y-5">
        <CategoryFilter
          categories={categories}
          selected={draftFilters.categories}
          onToggle={onToggleCategory}
        />
        <Separator />
        <BrandFilter
          brands={brands}
          selected={draftFilters.brands}
          onToggle={onToggleBrand}
        />
        <Separator />
        <PriceSlider
          min={priceBounds.min}
          max={priceBounds.max}
          step={priceBounds.step}
          valueMin={draftFilters.priceMin}
          valueMax={draftFilters.priceMax}
          onChange={onPriceChange}
        />
        <Separator />
        <WarehouseFilter
          warehouses={warehouses}
          value={draftFilters.warehouseId}
          onChange={onWarehouseChange}
        />
        <CreditToggle
          checked={draftFilters.creditEligibleOnly}
          onChange={onCreditChange}
        />
      </div>

      <div className="mt-6 space-y-2">
        <Button
          type="button"
          onClick={onApply}
          className="h-11 w-full rounded-xl bg-accent-blue text-sm font-semibold hover:bg-accent-blue/90"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Apply Filters
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="h-9 w-full text-xs font-medium text-slate-500"
        >
          Reset Filters
        </Button>
      </div>
    </aside>
  );
}
