"use client";

import { ArrowRight, Layers, Search } from "lucide-react";
import { formatInr } from "@/lib/format";
import {
  formatPricePerKg,
  getProductSupplyOrigin,
  type GradeSearchSuggestionItem,
  type GradeSearchSuggestions,
} from "@/lib/grade-search";
import { cn } from "@/lib/utils";

interface SearchSuggestionsProps {
  suggestions: GradeSearchSuggestions;
  items: GradeSearchSuggestionItem[];
  activeId: string | null;
  listId: string;
  onHover: (id: string) => void;
  onSelect: (item: GradeSearchSuggestionItem) => void;
}

export function SearchSuggestions({
  suggestions,
  items,
  activeId,
  listId,
  onHover,
  onSelect,
}: SearchSuggestionsProps) {
  const materials = items.filter(
    (item): item is Extract<GradeSearchSuggestionItem, { type: "material" }> =>
      item.type === "material",
  );
  const products = items.filter(
    (item): item is Extract<GradeSearchSuggestionItem, { type: "product" }> =>
      item.type === "product",
  );
  const viewAll = items.find((item) => item.type === "view-all");
  const query = suggestions.query.trim();

  return (
    <div
      id={listId}
      role="listbox"
      aria-label="Related grades and materials"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel"
    >
      {materials.length === 0 && products.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          No grades match{" "}
          <span className="font-semibold text-slate-700">“{query}”</span>. Try a
          material like PP, HDPE, or PVC.
        </p>
      ) : (
        <div className="max-h-[min(28rem,70vh)] overflow-y-auto py-1">
          {materials.length > 0 ? (
            <section className="px-1.5 pb-1">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Materials
              </p>
              {materials.map((item) => (
                <MaterialSuggestionRow
                  key={item.id}
                  item={item}
                  query={query}
                  active={activeId === item.id}
                  onHover={() => onHover(item.id)}
                  onSelect={() => onSelect(item)}
                />
              ))}
            </section>
          ) : null}

          {products.length > 0 ? (
            <section className="px-1.5 pb-1">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Related grades
              </p>
              {products.map((item) => (
                <ProductSuggestionRow
                  key={item.id}
                  item={item}
                  query={query}
                  active={activeId === item.id}
                  onHover={() => onHover(item.id)}
                  onSelect={() => onSelect(item)}
                />
              ))}
            </section>
          ) : null}
        </div>
      )}

      {viewAll ? (
        <button
          type="button"
          id={viewAll.id}
          role="option"
          aria-selected={activeId === viewAll.id}
          className={cn(
            "flex w-full items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-medium transition",
            activeId === viewAll.id
              ? "bg-brand/[0.06] text-brand"
              : "text-slate-600 hover:bg-slate-50",
          )}
          onMouseEnter={() => onHover(viewAll.id)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(viewAll)}
        >
          <span className="inline-flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0" />
            View all results for “{query}”
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold">
            {suggestions.totalProducts}{" "}
            {suggestions.totalProducts === 1 ? "grade" : "grades"}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </button>
      ) : null}
    </div>
  );
}

function MaterialSuggestionRow({
  item,
  query,
  active,
  onHover,
  onSelect,
}: {
  item: Extract<GradeSearchSuggestionItem, { type: "material" }>;
  query: string;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  const material = item.material;

  return (
    <button
      type="button"
      id={item.id}
      role="option"
      aria-selected={active}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
        active ? "bg-brand/[0.06]" : "hover:bg-slate-50",
      )}
      onMouseEnter={onHover}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Layers className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900">
          <Highlight text={material.code} query={query} />
        </span>
        <span className="block truncate text-xs text-slate-500">
          <Highlight text={material.name} query={query} />
          <span className="mx-1.5 text-slate-300">·</span>
          {material.gradeCount} {material.gradeCount === 1 ? "grade" : "grades"}
        </span>
      </span>
      <span className="shrink-0 text-xs font-semibold tabular-nums text-brand">
        From {formatInr(material.startingPrice, { compact: true })}/MT
      </span>
    </button>
  );
}

function ProductSuggestionRow({
  item,
  query,
  active,
  onHover,
  onSelect,
}: {
  item: Extract<GradeSearchSuggestionItem, { type: "product" }>;
  query: string;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  const product = item.product;
  const gradeCode = product.gradeCode ?? product.grade;
  const origin = getProductSupplyOrigin(product);

  return (
    <button
      type="button"
      id={item.id}
      role="option"
      aria-selected={active}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
        active ? "bg-brand/[0.06]" : "hover:bg-slate-50",
      )}
      onMouseEnter={onHover}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
    >
      <span className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-1.5 font-mono text-[10px] font-semibold text-slate-600">
        {product.grade}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900">
          <Highlight text={product.name} query={query} />
        </span>
        <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
          <span className="truncate font-mono text-slate-400">
            <Highlight text={gradeCode} query={query} />
          </span>
          <span className="text-slate-300">·</span>
          <span className="truncate">
            {product.materialType}
            {product.subCategory ? ` · ${product.subCategory}` : ""}
          </span>
          <span
            className={cn(
              "shrink-0 font-medium",
              origin === "imported" ? "text-violet-600" : "text-emerald-600",
            )}
          >
            {origin === "imported" ? "Imported" : "Domestic"}
          </span>
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-sm font-semibold tabular-nums text-brand">
          {formatInr(product.price, { compact: true })}
        </span>
        <span className="block text-[10px] text-slate-400">
          /MT · ₹{formatPricePerKg(product.price)}/kg
        </span>
      </span>
    </button>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-accent-blue/15 font-semibold text-inherit">
        {text.slice(index, index + q.length)}
      </mark>
      {text.slice(index + q.length)}
    </>
  );
}
