"use client";

import { useMemo } from "react";
import { Bell, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DOCUMENT_TYPE_LABELS } from "@/constants/documents";
import { formatDateDdMmYyyy } from "@/lib/format";
import {
  buildGenericDocumentContent,
  simulatePdfDownload,
} from "@/lib/document-actions";
import {
  computeDocumentsSummary,
  getFacetOptions,
  globalDocumentSearch,
  useDocumentsStore,
} from "@/store/documentsStore";
import { buildRecentlyGenerated } from "@/mock/documents-catalog";
import { DocumentFiltersBar } from "./DocumentFiltersBar";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import {
  DocumentQuickActions,
  DocumentSummaryCards,
} from "./DocumentSummaryCards";
import {
  DocumentsLoadingSkeleton,
  DocumentsModuleChrome,
} from "./DocumentsModuleChrome";

export function DocumentsDashboardPage() {
  const router = useRouter();
  const isHydrated = useDocumentsStore((s) => s.isHydrated);
  const filters = useDocumentsStore((s) => s.filters);
  const setFilters = useDocumentsStore((s) => s.setFilters);
  const resetFilters = useDocumentsStore((s) => s.resetFilters);
  const notifications = useDocumentsStore((s) => s.notifications);
  const downloads = useDocumentsStore((s) => s.downloads);
  const purchaseOrders = useDocumentsStore((s) => s.purchaseOrders);
  const invoices = useDocumentsStore((s) => s.invoices);
  const proformas = useDocumentsStore((s) => s.proformas);
  const gstInvoices = useDocumentsStore((s) => s.gstInvoices);
  const certificates = useDocumentsStore((s) => s.certificates);
  const setUploadOpen = useDocumentsStore((s) => s.setUploadOpen);
  const markNotificationRead = useDocumentsStore((s) => s.markNotificationRead);
  const openPreview = useDocumentsStore((s) => s.openPreview);

  const summary = useMemo(
    () =>
      computeDocumentsSummary({
        purchaseOrders,
        invoices,
        certificates,
        downloads,
        proformas,
        gstInvoices,
      }),
    [purchaseOrders, invoices, certificates, downloads, proformas, gstInvoices],
  );

  const facets = useMemo(
    () => getFacetOptions({ purchaseOrders, invoices }),
    [purchaseOrders, invoices],
  );

  const recent = useMemo(
    () =>
      buildRecentlyGenerated(
        purchaseOrders,
        invoices,
        certificates,
        gstInvoices,
      ),
    [purchaseOrders, invoices, certificates, gstInvoices],
  );

  const searchResults = useMemo(() => {
    const state = useDocumentsStore.getState();
    return globalDocumentSearch(state, filters).slice(0, 12);
  }, [filters, purchaseOrders, invoices, proformas, gstInvoices, certificates]);

  const unread = notifications.filter((n) => !n.read).slice(0, 5);
  const hasActiveSearch =
    !!filters.search.trim() ||
    filters.documentType !== "all" ||
    filters.status !== "all" ||
    filters.warehouse !== "all" ||
    filters.seller !== "all";

  const handleDownloadAll = () => {
    const bundle = downloads
      .slice(0, 10)
      .map((d) =>
        buildGenericDocumentContent({
          title: d.fileName,
          documentNumber: d.documentNumber,
          orderNumber: d.orderNumber,
          seller: d.seller,
          warehouse: d.warehouse,
          product: d.product,
        }),
      )
      .join("\n\n" + "=".repeat(48) + "\n\n");
    simulatePdfDownload("documents-bundle.pdf", bundle);
    toast.success("Download All started (top 10 files)");
  };

  if (!isHydrated) {
    return (
      <PageContainer>
        <DocumentsLoadingSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DocumentsModuleChrome />
      <PageHeader
        title="Documents"
        description="Enterprise document centre for purchase orders, tax invoices, GST, and downloads across your order lifecycle."
        breadcrumbs={[{ label: "Documents" }]}
      />

      <DocumentSummaryCards summary={summary} />
      <DocumentQuickActions
        onDownloadAll={handleDownloadAll}
        onUpload={() => setUploadOpen(true)}
      />

      <DocumentFiltersBar
        filters={filters}
        warehouses={facets.warehouses}
        sellers={facets.sellers}
        onChange={setFilters}
        onReset={resetFilters}
      />

      {hasActiveSearch ? (
        <Card className="border-slate-200 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Search Results ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {searchResults.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No documents match your filters.
              </p>
            ) : (
              searchResults.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3 text-left transition hover:border-brand/30 hover:bg-brand/[0.02]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.documentNumber} · {DOCUMENT_TYPE_LABELS[item.type]}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.orderNumber} · {item.product} · {item.seller} ·{" "}
                      {item.warehouse}
                    </p>
                  </div>
                  <DocumentStatusBadge status={item.status} />
                </button>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-slate-200 shadow-card xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recently Generated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => router.push(item.href)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3 text-left transition hover:border-brand/30 hover:bg-brand/[0.02]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.title} · {item.documentNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.orderNumber} · {item.seller} ·{" "}
                    {formatDateDdMmYyyy(item.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <DocumentStatusBadge status={item.status} />
                  <Eye className="h-4 w-4 text-slate-400" />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-2">
            {unread.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                You&apos;re all caught up.
              </p>
            ) : (
              unread.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.href) router.push(n.href);
                  }}
                  className="w-full rounded-xl border border-slate-100 bg-brand/[0.02] px-3 py-3 text-left transition hover:border-brand/30"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatDateDdMmYyyy(n.createdAt)}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Document Lifecycle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              "Purchase Request",
              "Order Confirmation",
              "Purchase Order",
              "Payment",
              "Shipment",
              "Delivery",
              "Documents Generated",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-xl border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand">
                  {step}
                </span>
                {i < 6 ? <span className="text-slate-300">→</span> : null}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Documents appear automatically as each order advances through the
            procurement lifecycle.
          </p>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                openPreview({
                  title: "Document Centre Overview",
                  categoryLabel: "Guide",
                  fileName: "documents-overview.pdf",
                  content: buildGenericDocumentContent({
                    title: "Document Centre Overview",
                    documentNumber: "GUIDE-DOCS-001",
                    extraLines: [
                      "1. Purchase Order Generated after PetroTrade confirmation",
                      "2. Invoice Generated after commercial confirmation",
                      "3. Payment Completed unlocks receipts",
                      "4. Shipment Documents Ready (packing, challan, e-way)",
                      "5. GST Invoice Generated for tax compliance",
                      "6. Delivery Completed",
                    ],
                  }),
                });
              }}
            >
              Preview Lifecycle Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
