"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  OFFER_CATEGORIES,
  OFFER_DISCOUNT_THRESHOLDS,
  OFFER_PAYMENT_OPTIONS,
  OFFER_TYPE_FILTER_OPTIONS,
} from "@/mock/offers";
import { formatInr } from "@/lib/format";
import type { OfferFiltersState, OfferPriceBounds } from "@/types/offers";
import type { MarketplaceParentCategoryId } from "@/types/marketplace";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface OfferFilterOption {
  id: string;
  name: string;
}

interface OfferFilterPanelProps {
  draftFilters: OfferFiltersState;
  priceBounds: OfferPriceBounds;
  /** Derived from live offers; never hardcoded. */
  brands: OfferFilterOption[];
  warehouses: OfferFilterOption[];
  resultCount?: number;
  onToggleCategory: (id: MarketplaceParentCategoryId) => void;
  onToggleBrand: (id: string) => void;
  onWarehouseChange: (id: string | null) => void;
  onPriceChange: (min: number, max: number) => void;
  onTogglePaymentType: (id: OfferFiltersState["paymentTypes"][number]) => void;
  onToggleOfferType: (id: OfferFiltersState["offerTypes"][number]) => void;
  onCreditChange: (enabled: boolean) => void;
  onMinQuantityChange: (qty: number | null) => void;
  onMinDiscountChange: (percent: number | null) => void;
  onInStockChange: (enabled: boolean) => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
}

export function OfferFilterPanel({
  draftFilters,
  priceBounds,
  brands,
  warehouses,
  resultCount,
  onToggleCategory,
  onToggleBrand,
  onWarehouseChange,
  onPriceChange,
  onTogglePaymentType,
  onToggleOfferType,
  onCreditChange,
  onMinQuantityChange,
  onMinDiscountChange,
  onInStockChange,
  onApply,
  onReset,
  className,
}: OfferFilterPanelProps) {
  return (
    <aside
      className={cn(
        "flex h-fit flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card",
        className,
      )}
    >
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
        {resultCount != null ? (
          <p className="mt-0.5 text-xs text-slate-500">
            {resultCount} offers found
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <FilterGroup title="Category">
          {OFFER_CATEGORIES.map((category) => (
            <CheckRow
              key={category.id}
              id={`cat-${category.id}`}
              label={category.name}
              checked={draftFilters.categories.includes(category.id)}
              onChange={() => onToggleCategory(category.id)}
            />
          ))}
        </FilterGroup>

        <Separator />

        {brands.length > 1 ? (
          <>
            <FilterGroup title="Manufacturer">
              {brands.map((brand) => (
                <CheckRow
                  key={brand.id}
                  id={`brand-${brand.id}`}
                  label={brand.name}
                  checked={draftFilters.brands.includes(brand.id)}
                  onChange={() => onToggleBrand(brand.id)}
                />
              ))}
            </FilterGroup>

            <Separator />
          </>
        ) : null}

        {warehouses.length ? (
          <>
            <FilterGroup title="Warehouse">
              <div className="space-y-1">
                <WarehouseBtn
                  active={!draftFilters.warehouseId}
                  onClick={() => onWarehouseChange(null)}
                >
                  All Warehouses
                </WarehouseBtn>
                {warehouses.map((wh) => (
                  <WarehouseBtn
                    key={wh.id}
                    active={draftFilters.warehouseId === wh.id}
                    onClick={() => onWarehouseChange(wh.id)}
                  >
                    {wh.name}
                  </WarehouseBtn>
                ))}
              </div>
            </FilterGroup>

            <Separator />
          </>
        ) : null}

        <FilterGroup title="Price Range">
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>{formatInr(draftFilters.priceMin, { compact: true })}</span>
              <span>{formatInr(draftFilters.priceMax, { compact: true })}</span>
            </div>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={priceBounds.step}
              value={draftFilters.priceMin}
              onChange={(e) =>
                onPriceChange(
                  Math.min(Number(e.target.value), draftFilters.priceMax),
                  draftFilters.priceMax,
                )
              }
              className="w-full accent-brand"
            />
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={priceBounds.step}
              value={draftFilters.priceMax}
              onChange={(e) =>
                onPriceChange(
                  draftFilters.priceMin,
                  Math.max(Number(e.target.value), draftFilters.priceMin),
                )
              }
              className="w-full accent-brand"
            />
          </div>
        </FilterGroup>

        <Separator />

        <FilterGroup title="Minimum Quantity (MT)">
          <Input
            type="number"
            min={0}
            placeholder="e.g. 25"
            value={draftFilters.minQuantity ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onMinQuantityChange(val ? Number(val) : null);
            }}
            className="h-9 rounded-lg text-sm"
          />
        </FilterGroup>

        <Separator />

        <FilterGroup title="Discount">
          {OFFER_DISCOUNT_THRESHOLDS.map((threshold) => (
            <CheckRow
              key={threshold.value}
              id={`disc-${threshold.value}`}
              label={threshold.label}
              checked={draftFilters.minDiscountPercent === threshold.value}
              onChange={() =>
                onMinDiscountChange(
                  draftFilters.minDiscountPercent === threshold.value
                    ? null
                    : threshold.value,
                )
              }
            />
          ))}
        </FilterGroup>

        <Separator />

        <FilterGroup title="Offer Type">
          {OFFER_TYPE_FILTER_OPTIONS.map((option) => (
            <CheckRow
              key={option.id}
              id={`type-${option.id}`}
              label={option.label}
              checked={draftFilters.offerTypes.includes(option.id)}
              onChange={() => onToggleOfferType(option.id)}
            />
          ))}
        </FilterGroup>

        <Separator />

        <FilterGroup title="Availability">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            <Label htmlFor="in-stock" className="text-sm text-slate-700">
              In stock only
            </Label>
            <Switch
              id="in-stock"
              checked={draftFilters.inStockOnly}
              onCheckedChange={onInStockChange}
            />
          </div>
        </FilterGroup>

        <FilterGroup title="Credit Eligible">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            <Label htmlFor="credit-eligible" className="text-sm text-slate-700">
              Credit eligible only
            </Label>
            <Switch
              id="credit-eligible"
              checked={draftFilters.creditEligibleOnly}
              onCheckedChange={onCreditChange}
            />
          </div>
          <div className="mt-2 space-y-1.5">
            {OFFER_PAYMENT_OPTIONS.map((option) => (
              <CheckRow
                key={option.id}
                id={`pay-${option.id}`}
                label={option.label}
                checked={draftFilters.paymentTypes.includes(option.id)}
                onChange={() => onTogglePaymentType(option.id)}
              />
            ))}
          </div>
        </FilterGroup>
      </div>

      <div className="sticky -bottom-4 z-10 -mx-4 mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-xl text-sm"
          onClick={onReset}
        >
          Clear All
        </Button>
        <Button
          type="button"
          className="h-9 rounded-xl bg-brand text-sm hover:bg-brand-700"
          onClick={onApply}
        >
          Apply Filters
        </Button>
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function CheckRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer text-sm text-slate-700">
        {label}
      </Label>
    </div>
  );
}

function WarehouseBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg px-2 py-1.5 text-left text-sm transition",
        active
          ? "bg-brand/5 font-semibold text-brand"
          : "text-slate-600 hover:bg-slate-50",
      )}
    >
      {children}
    </button>
  );
}
