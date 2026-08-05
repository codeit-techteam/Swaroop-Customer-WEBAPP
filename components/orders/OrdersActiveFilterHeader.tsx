"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrdersActiveFilterHeaderProps {
  title: string;
  count: number;
  chipLabel?: string | null;
  onClearKpiFilter?: () => void;
  hasDropdownFilters?: boolean;
  onClearAll?: () => void;
  className?: string;
}

export function OrdersActiveFilterHeader({
  title,
  count,
  chipLabel,
  onClearKpiFilter,
  hasDropdownFilters = false,
  onClearAll,
  className,
}: OrdersActiveFilterHeaderProps) {
  const orderLabel = count === 1 ? "Order" : "Orders";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <span className="text-sm text-slate-500">
          {count} {orderLabel}
        </span>
        {chipLabel ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            Showing:
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-medium text-slate-700">
              {chipLabel}
              {onClearKpiFilter ? (
                <button
                  type="button"
                  onClick={onClearKpiFilter}
                  className="rounded-full p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                  aria-label={`Clear ${chipLabel} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {chipLabel && onClearKpiFilter ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg text-slate-600"
            onClick={onClearKpiFilter}
          >
            Clear Filter
          </Button>
        ) : null}
        {hasDropdownFilters && onClearAll ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg"
            onClick={onClearAll}
          >
            Clear All
          </Button>
        ) : null}
      </div>
    </div>
  );
}
