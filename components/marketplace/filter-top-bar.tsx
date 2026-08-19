"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandFilter } from "./brand-filter";
import { PriceSlider } from "./price-slider";
import { WarehouseFilter } from "./warehouse-filter";
import { CreditToggle } from "./credit-toggle";
import { MarketplaceCategoryChips } from "./marketplace-category-chips";
import { DEFAULT_MARKETPLACE_FILTERS } from "@/mock/filters";
import type {
  MarketplaceBrand,
  MarketplaceCategory,
  MarketplaceFiltersState,
  MarketplaceParentCategoryId,
  MarketplaceWarehouse,
  PriceRangeBounds,
} from "@/types/marketplace";
import { cn } from "@/lib/utils";

interface FilterTopBarProps {
  categories: MarketplaceCategory[];
  brands: MarketplaceBrand[];
  warehouses: MarketplaceWarehouse[];
  draftFilters: MarketplaceFiltersState;
  appliedFilters: MarketplaceFiltersState;
  activeCategoryId: MarketplaceParentCategoryId | null;
  priceBounds: PriceRangeBounds;
  onSelectCategory: (categoryId: MarketplaceParentCategoryId | null) => void;
  onToggleBrand: (brandId: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onWarehouseChange: (warehouseId: string | null) => void;
  onCreditChange: (enabled: boolean) => void;
  onApply: () => void;
  onReset: () => void;
  /** When false, category chips are rendered elsewhere on the page. */
  showCategories?: boolean;
  className?: string;
}

export function FilterTopBar({
  categories,
  brands,
  warehouses,
  draftFilters,
  appliedFilters,
  activeCategoryId,
  priceBounds,
  onSelectCategory,
  onToggleBrand,
  onPriceChange,
  onWarehouseChange,
  onCreditChange,
  onApply,
  onReset,
  showCategories = true,
  className,
}: FilterTopBarProps) {
  const [brandOpen, setBrandOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const brandActive = appliedFilters.brands.length > 0;
  const priceActive =
    appliedFilters.priceMin !== priceBounds.min ||
    appliedFilters.priceMax !== priceBounds.max;
  const warehouseActive = Boolean(
    appliedFilters.warehouseId && appliedFilters.warehouseId !== "wh-all",
  );
  const creditActive = appliedFilters.creditEligibleOnly;
  const hasSecondaryFilters =
    brandActive || priceActive || warehouseActive || creditActive;

  const handleApply = () => {
    onApply();
    setBrandOpen(false);
    setPriceOpen(false);
    setWarehouseOpen(false);
    setCreditOpen(false);
    setMobileOpen(false);
  };

  const filterPanel = (
    <div className="space-y-5">
      <BrandFilter
        brands={brands}
        selected={draftFilters.brands}
        onToggle={onToggleBrand}
      />
      <PriceSlider
        min={priceBounds.min}
        max={priceBounds.max}
        step={priceBounds.step}
        valueMin={draftFilters.priceMin}
        valueMax={draftFilters.priceMax}
        onChange={onPriceChange}
      />
      <WarehouseFilter
        warehouses={warehouses}
        value={draftFilters.warehouseId}
        onChange={onWarehouseChange}
      />
      <CreditToggle
        checked={draftFilters.creditEligibleOnly}
        onChange={onCreditChange}
      />
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          className="h-10 flex-1 rounded-xl text-sm"
          onClick={onReset}
        >
          Clear All
        </Button>
        <Button
          type="button"
          className="h-10 flex-1 rounded-xl bg-brand text-sm hover:bg-brand-700"
          onClick={handleApply}
        >
          Apply
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card",
        className,
      )}
    >
      {showCategories ? (
        <MarketplaceCategoryChips
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelect={onSelectCategory}
        />
      ) : null}

      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          showCategories && "mt-3 border-t border-slate-100 pt-3",
        )}
      >
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <FilterPill
            label="Brand"
            active={brandActive}
            count={appliedFilters.brands.length || undefined}
            open={brandOpen}
            onOpenChange={setBrandOpen}
          >
            <BrandFilter
              brands={brands}
              selected={draftFilters.brands}
              onToggle={onToggleBrand}
            />
            <PopoverActions onApply={handleApply} onReset={onReset} />
          </FilterPill>

          <FilterPill
            label="Price"
            active={priceActive}
            open={priceOpen}
            onOpenChange={setPriceOpen}
          >
            <PriceSlider
              min={priceBounds.min}
              max={priceBounds.max}
              step={priceBounds.step}
              valueMin={draftFilters.priceMin}
              valueMax={draftFilters.priceMax}
              onChange={onPriceChange}
            />
            <PopoverActions onApply={handleApply} onReset={onReset} />
          </FilterPill>

          <FilterPill
            label="Warehouse"
            active={warehouseActive}
            open={warehouseOpen}
            onOpenChange={setWarehouseOpen}
          >
            <WarehouseFilter
              warehouses={warehouses}
              value={draftFilters.warehouseId}
              onChange={onWarehouseChange}
            />
            <PopoverActions onApply={handleApply} onReset={onReset} />
          </FilterPill>

          <FilterPill
            label="Credit"
            active={creditActive}
            open={creditOpen}
            onOpenChange={setCreditOpen}
          >
            <CreditToggle
              checked={draftFilters.creditEligibleOnly}
              onChange={onCreditChange}
            />
            <PopoverActions onApply={handleApply} onReset={onReset} />
          </FilterPill>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full border-slate-200 px-4 text-sm font-medium md:hidden"
            >
              <SlidersHorizontal
                className="mr-1.5 h-4 w-4"
                aria-hidden="true"
              />
              Filters
              {hasSecondaryFilters ? (
                <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  !
                </span>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{filterPanel}</div>
          </SheetContent>
        </Sheet>

        {hasSecondaryFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  count,
  open,
  onOpenChange,
  children,
}: {
  label: string;
  active: boolean;
  count?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition",
            active
              ? "border-brand bg-brand/5 text-brand"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
          )}
        >
          {label}
          {count ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          ) : null}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-4">
        {children}
      </PopoverContent>
    </Popover>
  );
}

function PopoverActions({
  onApply,
  onReset,
}: {
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex gap-2 border-t border-slate-100 pt-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 flex-1 rounded-xl"
        onClick={onReset}
      >
        Reset
      </Button>
      <Button
        type="button"
        size="sm"
        className="h-9 flex-1 rounded-xl bg-brand hover:bg-brand-700"
        onClick={onApply}
      >
        Apply
      </Button>
    </div>
  );
}

export function hasActiveMarketplaceFilters(
  filters: MarketplaceFiltersState,
  priceBounds: PriceRangeBounds,
): boolean {
  return (
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.priceMin !== priceBounds.min ||
    filters.priceMax !== priceBounds.max ||
    Boolean(filters.warehouseId && filters.warehouseId !== "wh-all") ||
    filters.creditEligibleOnly
  );
}

export { DEFAULT_MARKETPLACE_FILTERS };
