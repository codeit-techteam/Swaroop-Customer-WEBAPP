"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Search, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import {
  formatPricePerKg,
  getProductSupplyOrigin,
  searchProductsByGrade,
} from "@/lib/grade-search";
import { formatInr } from "@/lib/format";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import type {
  GradeOriginFilter,
  MarketplaceProduct,
} from "@/types/marketplace";
import { cn } from "@/lib/utils";

const ORIGIN_OPTIONS: Array<{ value: GradeOriginFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "domestic", label: "Domestic" },
  { value: "imported", label: "Imported" },
];

interface GradeSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
  initialOrigin?: GradeOriginFilter;
}

export function GradeSearchModal({
  open,
  onOpenChange,
  initialQuery = "",
  initialOrigin = "all",
}: GradeSearchModalProps) {
  const router = useRouter();
  const products = useMarketplaceStore((s) => s.products);
  const setSearch = useMarketplaceStore((s) => s.setSearch);
  const setOriginFilter = useMarketplaceStore((s) => s.setOriginFilter);

  const [query, setQuery] = useState(initialQuery);
  const [origin, setOrigin] = useState<GradeOriginFilter>(initialOrigin);

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setOrigin(initialOrigin);
  }, [open, initialQuery, initialOrigin]);

  const results = useMemo(
    () => searchProductsByGrade(products, query, origin),
    [products, query, origin],
  );

  function openProduct(product: MarketplaceProduct) {
    onOpenChange(false);
    router.push(`${ROUTES.marketplaceProduct}/${product.id}`);
  }

  function viewAllInMarketplace() {
    setSearch(query.trim());
    setOriginFilter(origin);
    onOpenChange(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (origin !== "all") params.set("origin", origin);
    const qs = params.toString();
    router.push(qs ? `${ROUTES.marketplace}?${qs}` : ROUTES.marketplace);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-5 text-left">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Search your grade
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Search for polymer grades and grade groups
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search PP, HDPE, PVC, raffia, bottle grade…"
              className="h-11 rounded-xl pl-9"
              aria-label="Search grade"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Origin:
            </span>
            {ORIGIN_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setOrigin(option.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  origin === option.value
                    ? "bg-brand text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-slate-100">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Grade</th>
                <th className="px-3 py-3 text-right">Producer (₹/KG)</th>
                <th className="px-6 py-3 text-right">Market (₹/KG)</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    {query.trim()
                      ? "No grades match your search. Try another term or origin filter."
                      : "Type a grade name to search the catalogue."}
                  </td>
                </tr>
              ) : (
                results.map((product) => (
                  <GradeResultRow
                    key={product.id}
                    product={product}
                    onSelect={() => openProduct(product)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            {results.length} {results.length === 1 ? "grade" : "grades"} found
            {origin !== "all"
              ? ` · ${origin === "imported" ? "Imported" : "Domestic"}`
              : ""}
          </p>
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={!query.trim() && origin === "all"}
            onClick={viewAllInMarketplace}
          >
            View in Marketplace
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GradeResultRow({
  product,
  onSelect,
}: {
  product: MarketplaceProduct;
  onSelect: () => void;
}) {
  const supplyOrigin = getProductSupplyOrigin(product);
  const pricePerKg = formatPricePerKg(product.price);

  return (
    <tr
      className="cursor-pointer border-t border-slate-50 transition hover:bg-brand/[0.03]"
      onClick={onSelect}
    >
      <td className="px-6 py-3.5">
        <p className="font-semibold text-slate-900">
          {product.grade} {product.name}{" "}
          <span className="font-normal text-slate-500">
            ({product.brandShortName})
          </span>
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {product.materialType}
          <span className="mx-1.5 text-slate-300">·</span>
          <span
            className={cn(
              "font-medium",
              supplyOrigin === "imported"
                ? "text-violet-600"
                : "text-emerald-600",
            )}
          >
            {supplyOrigin === "imported" ? "Imported" : "Domestic"}
          </span>
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          <TrendingUp className="h-3 w-3" />
          View product
          <LineChart className="h-3 w-3 opacity-60" />
        </button>
      </td>
      <td className="px-3 py-3.5 text-right tabular-nums text-slate-400">—</td>
      <td className="px-6 py-3.5 text-right">
        <p className="font-semibold tabular-nums text-brand">₹{pricePerKg}</p>
        <p className="text-[11px] text-slate-400">F.O.R.</p>
        <p className="text-[10px] text-slate-400">
          {formatInr(product.price, { compact: true })}/MT
        </p>
      </td>
    </tr>
  );
}
