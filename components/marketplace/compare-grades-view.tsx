"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  GitCompareArrows,
  Lock,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { useCompareStore } from "@/store/compareStore";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import type { MarketplaceProduct } from "@/types/marketplace";
import { cn } from "@/lib/utils";

const MAX_COMPARE = 4;

type CompareRow = {
  label: string;
  group: "commercial" | "technical" | "logistics";
  values: string[];
  highlightCheapest?: boolean;
  numeric?: number[];
};

function stockLabel(status: MarketplaceProduct["stockStatus"]) {
  if (status === "in_stock") return "In Stock";
  if (status === "limited") return "Limited Stock";
  return "Out of Stock";
}

function buildRows(items: MarketplaceProduct[]): CompareRow[] {
  if (items.length === 0) return [];

  return [
    {
      label: "Grade Code",
      group: "commercial",
      values: items.map((p) => p.gradeCode ?? p.grade),
    },
    {
      label: "Material",
      group: "commercial",
      values: items.map((p) => p.grade),
    },
    {
      label: "Category",
      group: "commercial",
      values: items.map(
        (p) =>
          `${p.materialType}${p.subCategory ? ` · ${p.subCategory}` : ""}`,
      ),
    },
    {
      label: "Price / MT",
      group: "commercial",
      values: items.map((p) => formatInr(p.price)),
      highlightCheapest: true,
      numeric: items.map((p) => p.price),
    },
    {
      label: "MOQ",
      group: "commercial",
      values: items.map((p) => formatQuantityMt(p.moq)),
      numeric: items.map((p) => p.moq),
    },
    {
      label: "Availability",
      group: "commercial",
      values: items.map((p) => stockLabel(p.stockStatus)),
    },
    {
      label: "Available Qty",
      group: "commercial",
      values: items.map((p) =>
        formatQuantityMt(p.availableQuantity ?? p.stock),
      ),
    },
    {
      label: "MFI",
      group: "technical",
      values: items.map((p) => p.technicalSpecs?.mfi ?? "—"),
    },
    {
      label: "Density",
      group: "technical",
      values: items.map((p) => p.technicalSpecs?.density ?? "—"),
    },
    {
      label: "Form",
      group: "technical",
      values: items.map((p) => p.technicalSpecs?.form ?? "—"),
    },
    {
      label: "IV / Purity",
      group: "technical",
      values: items.map(
        (p) => p.technicalSpecs?.iv ?? p.technicalSpecs?.purity ?? "—",
      ),
    },
    {
      label: "Location",
      group: "logistics",
      values: items.map((p) => p.origin),
    },
    {
      label: "Delivery",
      group: "logistics",
      values: items.map((p) => p.eta),
    },
    {
      label: "Seller",
      group: "logistics",
      values: items.map(() => "Identity Protected"),
    },
  ];
}

const GROUP_LABELS: Record<CompareRow["group"], string> = {
  commercial: "Commercial",
  technical: "Technical Specs",
  logistics: "Logistics & Trust",
};

export function CompareGradesView() {
  const [mounted, setMounted] = useState(false);
  const ids = useCompareStore((s) => s.ids);
  const clear = useCompareStore((s) => s.clear);
  const remove = useCompareStore((s) => s.remove);
  const toggle = useCompareStore((s) => s.toggle);
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

  const rows = useMemo(() => buildRows(items), [items]);

  const suggestions = useMemo(() => {
    const selected = new Set(ids);
    return catalog.filter((product) => !selected.has(product.id)).slice(0, 6);
  }, [catalog, ids]);

  const emptySlots = Math.max(0, MAX_COMPARE - items.length);
  const canCompare = items.length >= 2;

  if (!mounted) {
    return (
      <PageContainer className="space-y-5">
        <PageHeader
          title="Compare Grades"
          description="Side-by-side commercial and technical comparison."
          breadcrumbs={[
            { label: "Marketplace", href: ROUTES.marketplace },
            { label: "Compare" },
          ]}
        />
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Compare Grades"
        description="Compare price, MOQ, technical specs and delivery — without revealing seller identity."
        breadcrumbs={[
          { label: "Marketplace", href: ROUTES.marketplace },
          { label: "Compare" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
            <Lock className="h-3 w-3" aria-hidden />
            Seller Identity Protected
          </span>
          <span className="text-sm text-slate-500">
            {items.length} of {MAX_COMPARE} slots used
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-9 rounded-xl">
            <Link href={ROUTES.marketplaceCompareBrowse}>
              <Plus className="h-4 w-4" />
              Add Grades
            </Link>
          </Button>
          {items.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-xl text-slate-600"
              onClick={clear}
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          ) : null}
        </div>
      </div>

      {/* Slot cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((product) => (
          <div
            key={product.id}
            className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
          >
            <button
              type="button"
              onClick={() => remove(product.id)}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              aria-label={`Remove ${product.name} from comparison`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-3 pr-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-brand">
                {product.grade.slice(0, 4).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {product.name}
                </p>
                <p className="font-mono text-[11px] text-slate-400">
                  {product.gradeCode ?? product.grade}
                </p>
              </div>
            </div>
            <p className="mt-3 text-lg font-bold tabular-nums text-brand">
              {formatInr(product.price)}
              <span className="ml-1 text-xs font-medium text-slate-400">
                / MT
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.verified !== false ? (
                <Badge className="rounded-md border-0 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50">
                  <ShieldCheck className="mr-0.5 h-3 w-3" />
                  Verified
                </Badge>
              ) : null}
              <Badge
                variant="outline"
                className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
              >
                {stockLabel(product.stockStatus)}
              </Badge>
            </div>
            <Button
              asChild
              size="sm"
              className="mt-4 h-9 w-full rounded-xl bg-brand text-xs hover:bg-brand-700"
            >
              <Link href={`${ROUTES.marketplaceProduct}/${product.id}`}>
                View Details
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        ))}

        {Array.from({ length: emptySlots }).map((_, index) => (
          <Link
            key={`slot-${index}`}
            href={ROUTES.marketplaceCompareBrowse}
            className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-center transition hover:border-brand/40 hover:bg-brand/[0.03]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
              <Plus className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Add a grade</p>
            <p className="text-xs text-slate-500">
              Select from marketplace to fill this slot
            </p>
          </Link>
        ))}
      </div>

      {!canCompare ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-card">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <GitCompareArrows className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {items.length === 0
              ? "Start a comparison"
              : "Add one more grade"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Select 2–4 grades from the marketplace to compare price, MFI, MOQ
            and delivery side by side.
          </p>
          <Button
            asChild
            className="mt-5 rounded-xl bg-brand hover:bg-brand-700"
          >
            <Link href={ROUTES.marketplaceCompareBrowse}>Browse Marketplace</Link>
          </Button>

          {suggestions.length > 0 ? (
            <div className="mt-8 border-t border-slate-100 pt-6 text-left">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Suggested grades to add
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggle(product.id)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-left transition hover:border-brand/30 hover:bg-white"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {product.name}
                      </p>
                      <p className="text-xs tabular-nums text-slate-500">
                        {product.grade} · {formatInr(product.price)} / MT
                      </p>
                    </div>
                    <Plus className="h-4 w-4 shrink-0 text-brand" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
              <GitCompareArrows className="h-4 w-4 text-brand" />
              Comparison matrix
            </p>
            <p className="text-xs text-slate-500">
              Lowest price highlighted in green
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/90">
                  <th className="sticky left-0 z-10 min-w-[140px] bg-slate-50/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 backdrop-blur">
                    Attribute
                  </th>
                  {items.map((product) => (
                    <th
                      key={product.id}
                      className="min-w-[200px] px-4 py-3 text-left"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {product.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                        {product.gradeCode ?? product.grade}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  ["commercial", "technical", "logistics"] as const
                ).map((group) => {
                  const groupRows = rows.filter((row) => row.group === group);
                  if (groupRows.length === 0) return null;
                  return (
                    <GroupRows
                      key={group}
                      label={GROUP_LABELS[group]}
                      rows={groupRows}
                      colSpan={items.length + 1}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function GroupRows({
  label,
  rows,
  colSpan,
}: {
  label: string;
  rows: CompareRow[];
  colSpan: number;
}) {
  return (
    <>
      <tr className="border-b border-slate-100 bg-slate-50/60">
        <td
          colSpan={colSpan}
          className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500"
        >
          {label}
        </td>
      </tr>
      {rows.map((row, index) => {
        const minValue =
          row.highlightCheapest && row.numeric
            ? Math.min(...row.numeric)
            : null;

        return (
          <tr
            key={row.label}
            className={cn(
              "border-b border-slate-100",
              index % 2 === 1 && "bg-slate-50/30",
            )}
          >
            <td className="sticky left-0 z-10 bg-white/95 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 backdrop-blur">
              {row.label}
            </td>
            {row.values.map((value, i) => {
              const isBest =
                row.highlightCheapest &&
                row.numeric != null &&
                row.numeric[i] === minValue;

              return (
                <td
                  key={`${row.label}-${i}`}
                  className={cn(
                    "px-4 py-3 font-medium tabular-nums text-slate-800",
                    isBest && "bg-emerald-50/80 font-semibold text-emerald-800",
                  )}
                >
                  {value}
                  {isBest ? (
                    <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      Best
                    </span>
                  ) : null}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}
