"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UniversalSearchSuggestions } from "./universal-search-suggestions";
import { materialsFromCatalog } from "@/lib/material-taxonomy";
import {
  getUniversalSearchResults,
  isGstRelatedQuery,
  resolveUniversalFallbackHref,
  type UniversalSearchResult,
} from "@/lib/universal-search";
import { useDocumentsStore } from "@/store/documentsStore";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import { useOrdersCatalogStore } from "@/store/ordersCatalogStore";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import { useShipmentTrackingStore } from "@/store/shipmentTrackingStore";

interface GradeSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

export function GradeSearchModal({
  open,
  onOpenChange,
  initialQuery = "",
}: GradeSearchModalProps) {
  const router = useRouter();
  const listId = useId();
  const products = useMarketplaceStore((s) => s.products);
  const setSearch = useMarketplaceStore((s) => s.setSearch);
  const setOriginFilter = useMarketplaceStore((s) => s.setOriginFilter);

  const invoices = useDocumentsStore((s) => s.invoices);
  const gstInvoices = useDocumentsStore((s) => s.gstInvoices);
  const purchaseOrders = useDocumentsStore((s) => s.purchaseOrders);
  const proformas = useDocumentsStore((s) => s.proformas);
  const certificates = useDocumentsStore((s) => s.certificates);
  const orders = useOrdersCatalogStore((s) => s.items);
  const payments = usePaymentsCatalogStore((s) => s.payments);
  const purchaseRequests = usePurchaseRequestTrackingStore((s) => s.items);
  const shipments = useShipmentTrackingStore((s) => s.shipments);

  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setActiveIndex(0);
  }, [open, initialQuery]);

  const taxonomy = useMemo(() => materialsFromCatalog(products), [products]);
  const payload = useMemo(
    () =>
      getUniversalSearchResults(
        {
          products,
          materials: taxonomy,
          invoices,
          gstInvoices,
          purchaseOrders,
          proformas,
          certificates,
          orders,
          payments,
          purchaseRequests,
          shipments,
        },
        query,
      ),
    [
      products,
      taxonomy,
      invoices,
      gstInvoices,
      purchaseOrders,
      proformas,
      certificates,
      orders,
      payments,
      purchaseRequests,
      shipments,
      query,
    ],
  );

  const items = useMemo(() => {
    const flat = payload.groups.flatMap((group) => group.results);
    const trimmed = payload.query.trim();
    if (!trimmed) return flat;
    const gstQuery = isGstRelatedQuery(trimmed);
    return [
      ...flat,
      {
        id: `${listId}-view-all`,
        category: (gstQuery ? "tax_invoice" : "product") as UniversalSearchResult["category"],
        title: gstQuery
          ? `View tax invoices for “${trimmed}”`
          : `Search marketplace for “${trimmed}”`,
        subtitle: `${payload.total} ERP matches`,
        href: resolveUniversalFallbackHref(trimmed),
        score: 0,
      },
    ];
  }, [payload, listId]);

  const activeItem = items[activeIndex] ?? null;
  const viewAllId = `${listId}-view-all`;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function goToFallback(searchQuery: string) {
    const trimmed = searchQuery.trim();
    if (!isGstRelatedQuery(trimmed)) {
      setSearch(trimmed);
      setOriginFilter("all");
    }
    onOpenChange(false);
    router.push(resolveUniversalFallbackHref(trimmed));
  }

  function selectItem(item: UniversalSearchResult) {
    if (item.id === viewAllId) {
      goToFallback(query);
      return;
    }
    onOpenChange(false);
    router.push(item.href);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      onOpenChange(false);
      return;
    }
    if (items.length === 0) {
      if (event.key === "Enter" && query.trim()) {
        event.preventDefault();
        const firstHit = payload.flat[0];
        if (firstHit) selectItem(firstHit);
        else goToFallback(query);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % items.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + items.length) % items.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeItem) selectItem(activeItem);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-5 text-left">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Universal search
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Search GST, tax invoices, grades, orders, POs, payments, and more
            across the ERP.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-6 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="GST, GSTIN, invoice, grade, PO, order…"
              className="h-11 rounded-xl pl-9"
              aria-label="Universal ERP search"
              role="combobox"
              aria-expanded={Boolean(query.trim())}
              aria-controls={query.trim() ? listId : undefined}
              aria-activedescendant={
                query.trim() && activeItem ? activeItem.id : undefined
              }
              autoComplete="off"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-slate-100 px-3 py-2">
          {query.trim() ? (
            <UniversalSearchSuggestions
              payload={payload}
              items={items}
              activeId={activeItem?.id ?? null}
              listId={listId}
              onHover={(id) => {
                const index = items.findIndex((item) => item.id === id);
                if (index >= 0) setActiveIndex(index);
              }}
              onSelect={selectItem}
              onViewAll={() => goToFallback(query)}
            />
          ) : (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              Type to search anything in the ERP — GST, invoices, grades,
              orders, POs, payments, shipments.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            {payload.total}{" "}
            {payload.total === 1 ? "ERP match" : "ERP matches"}
          </p>
          <Button
            type="button"
            className="rounded-full bg-brand hover:bg-brand-700"
            onClick={() => {
              if (payload.flat[0]) selectItem(payload.flat[0]);
              else goToFallback(query);
            }}
            disabled={!query.trim()}
          >
            {isGstRelatedQuery(query) ? "Open tax invoices" : "Search"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
