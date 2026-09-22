"use client";

import {
  ArrowRight,
  FileText,
  Layers,
  Package,
  Receipt,
  Search,
  Truck,
  Wallet,
  ClipboardList,
  ShoppingCart,
  BadgeCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  UNIVERSAL_CATEGORY_LABELS,
  isGstRelatedQuery,
  type UniversalSearchCategory,
  type UniversalSearchPayload,
  type UniversalSearchResult,
} from "@/lib/universal-search";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<UniversalSearchCategory, LucideIcon> = {
  product: Package,
  material: Layers,
  tax_invoice: Receipt,
  gst_invoice: FileText,
  purchase_order: ClipboardList,
  proforma: FileText,
  order: ShoppingCart,
  payment: Wallet,
  purchase_request: ClipboardList,
  shipment: Truck,
  certificate: BadgeCheck,
};

interface UniversalSearchSuggestionsProps {
  payload: UniversalSearchPayload;
  items: UniversalSearchResult[];
  activeId: string | null;
  listId: string;
  onHover: (id: string) => void;
  onSelect: (item: UniversalSearchResult) => void;
  onViewAll: () => void;
}

export function UniversalSearchSuggestions({
  payload,
  items,
  activeId,
  listId,
  onHover,
  onSelect,
  onViewAll,
}: UniversalSearchSuggestionsProps) {
  const query = payload.query.trim();
  const viewAllId = `${listId}-view-all`;
  const gstQuery = isGstRelatedQuery(query);
  const viewAllLabel = gstQuery
    ? `View tax invoices for “${query}”`
    : `Search marketplace for “${query}”`;

  return (
    <div
      id={listId}
      role="listbox"
      aria-label="Universal ERP search results"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel"
    >
      {payload.total === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          No ERP matches for{" "}
          <span className="font-semibold text-slate-700">“{query}”</span>. Try
          GSTIN, invoice number, grade, PO, order, or payment ID.
        </p>
      ) : (
        <div className="max-h-[min(32rem,72vh)] overflow-y-auto py-1">
          {payload.groups.map((group) => {
            const Icon = CATEGORY_ICONS[group.category];
            return (
              <section key={group.category} className="px-1.5 pb-1">
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {group.label}
                </p>
                {group.results.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      id={item.id}
                      role="option"
                      aria-selected={isActive}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                        isActive ? "bg-brand/[0.06]" : "hover:bg-slate-50",
                      )}
                      onMouseEnter={() => onHover(item.id)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onSelect(item)}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          <Highlight text={item.title} query={query} />
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          <Highlight text={item.subtitle} query={query} />
                        </span>
                      </span>
                      {item.badge ? (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </section>
            );
          })}
        </div>
      )}

      {query ? (
        <button
          type="button"
          id={viewAllId}
          role="option"
          aria-selected={activeId === viewAllId}
          className={cn(
            "flex w-full items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-medium transition",
            activeId === viewAllId
              ? "bg-brand/[0.06] text-brand"
              : "text-slate-600 hover:bg-slate-50",
          )}
          onMouseEnter={() => onHover(viewAllId)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onViewAll}
        >
          <span className="inline-flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0" />
            {viewAllLabel}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold">
            {payload.total} {payload.total === 1 ? "match" : "matches"}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </button>
      ) : null}

      {items.length === 0 ? null : (
        <p className="sr-only">
          Showing {UNIVERSAL_CATEGORY_LABELS.tax_invoice}, products, orders, and
          more
        </p>
      )}
    </div>
  );
}

function Highlight({
  text,
  query,
}: {
  text: string | null | undefined;
  query: string;
}) {
  const safe = text == null ? "" : String(text);
  const q = (query ?? "").trim();
  if (!q || !safe) return <>{safe}</>;

  const index = safe.toLowerCase().indexOf(q.toLowerCase());
  if (index === -1) return <>{safe}</>;

  return (
    <>
      {safe.slice(0, index)}
      <mark className="rounded-sm bg-accent-blue/15 font-semibold text-inherit">
        {safe.slice(index, index + q.length)}
      </mark>
      {safe.slice(index + q.length)}
    </>
  );
}
