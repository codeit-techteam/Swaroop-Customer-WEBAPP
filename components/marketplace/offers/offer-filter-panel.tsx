"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  OFFER_BRANDS,
  OFFER_CATEGORIES,
  OFFER_PAYMENT_OPTIONS,
  OFFER_TYPE_OPTIONS,
  OFFER_WAREHOUSES,
} from "@/mock/offers";
import { formatInr } from "@/lib/format";
import type { OfferFiltersState, OfferPriceBounds } from "@/types/offers";
import type { MarketplaceParentCategoryId } from "@/types/marketplace";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface OfferFilterPanelProps {
  draftFilters: OfferFiltersState;
  priceBounds: OfferPriceBounds;
  onToggleCategory: (id: MarketplaceParentCategoryId) => void;
  onToggleBrand: (id: string) => void;
  onWarehouseChange: (id: string | null) => void;
  onPriceChange: (min: number, max: number) => void;
  onTogglePaymentType: (id: OfferFiltersState["paymentTypes"][number]) => void;
  onToggleOfferType: (id: OfferFiltersState["offerTypes"][number]) => void;
  onCreditChange: (enabled: boolean) => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
}

export function OfferFilterPanel({
  draftFilters,
  priceBounds,
  onToggleCategory,
  onToggleBrand,
  onWarehouseChange,
  onPriceChange,
  onTogglePaymentType,
  onToggleOfferType,
  onCreditChange,
  onApply,
  onReset,
  className,
}: OfferFilterPanelProps) {
  return (
    <aside
      className={cn(
        "flex h-fit flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card",
        className,
      )}
    >
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Filters</h2>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Refine marketplace offers
        </p>
      </div>

      <div className="space-y-5">
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

        <FilterGroup title="Brand">
          {OFFER_BRANDS.map((brand) => (
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

        <FilterGroup title="Warehouse">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onWarehouseChange(null)}
              className={cn(
                "w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition",
                !draftFilters.warehouseId
                  ? "bg-brand/5 font-semibold text-brand"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              All Warehouses
            </button>
            {OFFER_WAREHOUSES.map((wh) => (
              <button
                key={wh.id}
                type="button"
                onClick={() => onWarehouseChange(wh.id)}
                className={cn(
                  "w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition",
                  draftFilters.warehouseId === wh.id
                    ? "bg-brand/5 font-semibold text-brand"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {wh.name}
              </button>
            ))}
          </div>
        </FilterGroup>

        <Separator />

        <FilterGroup title="Price Range">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
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

        <FilterGroup title="Credit Eligible">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5">
            <Label htmlFor="credit-eligible" className="text-sm text-slate-700">
              Credit eligible only
            </Label>
            <Switch
              id="credit-eligible"
              checked={draftFilters.creditEligibleOnly}
              onCheckedChange={onCreditChange}
            />
          </div>
          <div className="mt-3 space-y-2">
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

        <Separator />

        <FilterGroup title="Offer Type">
          {OFFER_TYPE_OPTIONS.map((option) => (
            <CheckRow
              key={option.id}
              id={`type-${option.id}`}
              label={option.label}
              checked={draftFilters.offerTypes.includes(option.id)}
              onChange={() => onToggleOfferType(option.id)}
            />
          ))}
        </FilterGroup>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          onClick={onReset}
        >
          Clear Filters
        </Button>
        <Button
          type="button"
          className="h-10 rounded-xl bg-brand hover:bg-brand-700"
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
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
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
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer text-sm text-slate-700">
        {label}
      </Label>
    </div>
  );
}
