"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MARKETPLACE_SORT_OPTIONS } from "@/mock/filters";
import type { MarketplaceSortBy } from "@/types/marketplace";
import { cn } from "@/lib/utils";

interface SortDropdownProps {
  value: MarketplaceSortBy;
  onChange: (value: MarketplaceSortBy) => void;
  className?: string;
}

export function SortDropdown({
  value,
  onChange,
  className,
}: SortDropdownProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:inline">
        Sort By:
      </span>
      <Select
        value={value}
        onValueChange={(next) => onChange(next as MarketplaceSortBy)}
      >
        <SelectTrigger className="h-11 w-[180px] rounded-xl border-slate-200 bg-white text-sm font-medium shadow-sm">
          <SelectValue placeholder="Recommended" />
        </SelectTrigger>
        <SelectContent>
          {MARKETPLACE_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
