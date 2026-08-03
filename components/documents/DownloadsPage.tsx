"use client";

import { useMemo } from "react";
import { Download, Eye, Share2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import {
  DOWNLOAD_CATEGORY_LABELS,
  formatFileSize,
} from "@/constants/documents";
import { formatDateDdMmYyyy } from "@/lib/format";
import {
  buildGenericDocumentContent,
  shareDocumentText,
  simulatePdfDownload,
} from "@/lib/document-actions";
import {
  filterDownloads,
  getFacetOptions,
  useDocumentsStore,
} from "@/store/documentsStore";
import type { DownloadableDocument } from "@/types/documents";
import { DocumentFiltersBar } from "./DocumentFiltersBar";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import {
  DocumentsLoadingSkeleton,
  DocumentsModuleChrome,
} from "./DocumentsModuleChrome";

export function DownloadsPage() {
  const isHydrated = useDocumentsStore((s) => s.isHydrated);
  const downloads = useDocumentsStore((s) => s.downloads);
  const purchaseOrders = useDocumentsStore((s) => s.purchaseOrders);
  const invoices = useDocumentsStore((s) => s.invoices);
  const filters = useDocumentsStore((s) => s.filters);
  const setFilters = useDocumentsStore((s) => s.setFilters);
  const resetFilters = useDocumentsStore((s) => s.resetFilters);
  const markDownloaded = useDocumentsStore((s) => s.markDownloaded);
  const openPreview = useDocumentsStore((s) => s.openPreview);
  const setUploadOpen = useDocumentsStore((s) => s.setUploadOpen);

  const facets = useMemo(
    () => getFacetOptions({ purchaseOrders, invoices }),
    [purchaseOrders, invoices],
  );
  const rows = useMemo(
    () => filterDownloads(downloads, filters),
    [downloads, filters],
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    downloads.forEach((d) => {
      map.set(d.category, (map.get(d.category) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [downloads]);

  const contentFor = (d: DownloadableDocument) =>
    buildGenericDocumentContent({
      title: DOWNLOAD_CATEGORY_LABELS[d.category],
      documentNumber: d.documentNumber,
      orderNumber: d.orderNumber,
      seller: d.seller,
      warehouse: d.warehouse,
      product: d.product,
      extraLines: [
        `File Name     : ${d.fileName}`,
        `Category      : ${DOWNLOAD_CATEGORY_LABELS[d.category]}`,
        `Size          : ${formatFileSize(d.sizeBytes)}`,
        `Date          : ${d.date}`,
      ],
    });

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
        title="Downloads"
        description="All downloadable procurement files — POs, invoices, GST, certificates, packing lists, challans, e-way bills, and payment proofs."
        breadcrumbs={[
          { label: "Documents", href: ROUTES.documents },
          { label: "Downloads" },
        ]}
        actions={
          <Button
            className="rounded-xl bg-brand hover:bg-brand-700"
            onClick={() => setUploadOpen(true)}
          >
            Upload Supporting Document
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {byCategory.map(([cat, count]) => (
          <button
            key={cat}
            type="button"
            onClick={() =>
              setFilters({
                documentType: cat as DownloadableDocument["category"],
              })
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-brand/30 hover:text-brand"
          >
            {DOWNLOAD_CATEGORY_LABELS[cat as DownloadableDocument["category"]]}{" "}
            <span className="text-slate-400">({count})</span>
          </button>
        ))}
      </div>

      <DocumentFiltersBar
        filters={filters}
        warehouses={facets.warehouses}
        sellers={facets.sellers}
        onChange={setFilters}
        onReset={resetFilters}
        searchPlaceholder="Search file name, category, order, document number…"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((d) => (
          <Card
            key={d.id}
            className="border-slate-200 shadow-card transition hover:border-brand/30"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="min-w-0">
                <CardTitle className="truncate text-base">
                  {d.fileName}
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  {DOWNLOAD_CATEGORY_LABELS[d.category]}
                </p>
              </div>
              <DocumentStatusBadge status={d.status} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                  <p className="text-[10px] uppercase text-slate-500">Size</p>
                  <p className="font-semibold text-slate-900">
                    {formatFileSize(d.sizeBytes)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                  <p className="text-[10px] uppercase text-slate-500">Date</p>
                  <p className="font-semibold text-slate-900">
                    {formatDateDdMmYyyy(d.date)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {d.orderNumber} · {d.documentNumber} · {d.seller}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-xl bg-brand hover:bg-brand-700"
                  onClick={() => {
                    simulatePdfDownload(d.fileName, contentFor(d));
                    markDownloaded("download", d.id);
                    toast.success("Download started");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    openPreview({
                      title: d.fileName,
                      categoryLabel: DOWNLOAD_CATEGORY_LABELS[d.category],
                      fileName: d.fileName,
                      documentNumber: d.documentNumber,
                      orderNumber: d.orderNumber,
                      content: contentFor(d),
                      relatedId: d.id,
                    })
                  }
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={async () => {
                    const result = await shareDocumentText(
                      d.fileName,
                      contentFor(d),
                    );
                    toast.success(
                      result === "copied"
                        ? "Link details copied"
                        : result
                          ? "Shared"
                          : "Unable to share",
                    );
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">
          No downloadable files match your filters.
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          Showing {rows.length} of {downloads.length} files
        </p>
      )}
    </PageContainer>
  );
}
