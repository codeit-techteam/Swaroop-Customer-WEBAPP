"use client";

import { LayoutGrid, List } from "lucide-react";
import type { MarketplaceViewMode } from "@/types/marketplace";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  value: MarketplaceViewMode;
  onChange: (value: MarketplaceViewMode) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm",
        className,
      )}
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
          value === "grid"
            ? "bg-brand text-white"
            : "text-slate-400 hover:text-slate-700",
        )}
        aria-label="Grid view"
        aria-pressed={value === "grid"}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
          value === "list"
            ? "bg-brand text-white"
            : "text-slate-400 hover:text-slate-700",
        )}
        aria-label="List view"
        aria-pressed={value === "list"}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
