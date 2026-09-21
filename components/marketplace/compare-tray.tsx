"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GitCompareArrows, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { formatInr } from "@/lib/format";
import { useCompareStore } from "@/store/compareStore";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import type { MarketplaceProduct } from "@/types/marketplace";
import { cn } from "@/lib/utils";

const MAX_COMPARE = 4;

interface CompareTrayProps {
  /** Force show even with 0 items (compare browse mode) */
  forceVisible?: boolean;
  className?: string;
}

export function CompareTray({ forceVisible = false, className }: CompareTrayProps) {
  const [mounted, setMounted] = useState(false);
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const catalog = useMarketplaceStore((s) => s.products);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = useMemo(
    () =>
      ids
        .map((id) => catalog.find((product) => product.id === id))
        .filter((product): product is MarketplaceProduct => Boolean(product)),
    [catalog, ids],
  );

  if (!mounted) return null;
  if (!forceVisible && items.length === 0) return null;

  const canCompare = items.length >= 2;
  const slotsLeft = MAX_COMPARE - items.length;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur",
        className,
      )}
      role="region"
      aria-label="Grade comparison tray"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <GitCompareArrows className="h-4 w-4 text-brand" />
              Comparing {items.length}/{MAX_COMPARE}
            </p>
            {slotsLeft > 0 ? (
              <span className="text-xs text-slate-500">
                Add {slotsLeft} more grade{slotsLeft === 1 ? "" : "s"}
                {canCompare ? " or view comparison" : " to compare"}
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-700">
                Comparison slots full
              </span>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {items.map((product) => (
              <div
                key={product.id}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[10px] font-bold text-brand">
                  {product.grade.slice(0, 3).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="max-w-[140px] truncate text-xs font-semibold text-slate-800">
                    {product.name}
                  </p>
                  <p className="text-[10px] tabular-nums text-slate-500">
                    {formatInr(product.price)} / MT
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  className="rounded-full p-0.5 text-slate-400 hover:bg-white hover:text-red-600"
                  aria-label={`Remove ${product.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {Array.from({ length: slotsLeft }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex h-[42px] min-w-[96px] shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 text-[11px] font-medium text-slate-400"
              >
                Empty slot
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {items.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              onClick={clear}
            >
              Clear
            </Button>
          ) : null}
          <Button
            asChild
            className={cn(
              "h-10 rounded-xl px-4 font-semibold",
              canCompare
                ? "bg-brand hover:bg-brand-700"
                : "bg-slate-300 text-slate-600 hover:bg-slate-300",
            )}
          >
            <Link
              href={ROUTES.marketplaceCompare}
              aria-disabled={!canCompare}
              className={!canCompare ? "pointer-events-none" : undefined}
            >
              View Comparison
              {canCompare ? ` (${items.length})` : ""}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
