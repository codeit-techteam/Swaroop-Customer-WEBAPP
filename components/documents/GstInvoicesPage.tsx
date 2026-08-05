"use client";

import { useMemo } from "react";
import { Download, Eye, Printer } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import {
  buildGenericDocumentContent,
  printDocumentHtml,
  simulatePdfDownload,
} from "@/lib/document-actions";
import {
  filterGstInvoices,
  getFacetOptions,
  useDocumentsStore,
} from "@/store/documentsStore";
import type { GstInvoiceDocument } from "@/types/documents";
import { DocumentFiltersBar } from "./DocumentFiltersBar";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import {
  DocumentsLoadingSkeleton,
  DocumentsModuleChrome,
} from "./DocumentsModuleChrome";

export function GstInvoicesPage() {
  const isHydrated = useDocumentsStore((s) => s.isHydrated);
  const gstInvoices = useDocumentsStore((s) => s.gstInvoices);
  const purchaseOrders = useDocumentsStore((s) => s.purchaseOrders);
  const invoices = useDocumentsStore((s) => s.invoices);
  const filters = useDocumentsStore((s) => s.filters);
  const setFilters = useDocumentsStore((s) => s.setFilters);
  const resetFilters = useDocumentsStore((s) => s.resetFilters);
  const markDownloaded = useDocumentsStore((s) => s.markDownloaded);
  const openPreview = useDocumentsStore((s) => s.openPreview);

  const facets = useMemo(
    () => getFacetOptions({ purchaseOrders, invoices }),
    [purchaseOrders, invoices],
  );
  const rows = useMemo(
    () => filterGstInvoices(gstInvoices, filters),
    [gstInvoices, filters],
  );

  const contentFor = (g: GstInvoiceDocument) =>
    buildGenericDocumentContent({
      title: "GST Tax Invoice",
      documentNumber: g.invoiceNumber,
      orderNumber: g.orderNumber,
      seller: g.seller,
      warehouse: g.warehouse,
      product: g.product,
      extraLines: [
        `GSTIN         : ${g.gstNumber}`,
        `PO Number     : ${g.poNumber}`,
        `Taxable Value : ₹ ${g.taxableValue.toLocaleString("en-IN")}`,
        `CGST          : ₹ ${g.cgst.toLocaleString("en-IN")}`,
        `SGST          : ₹ ${g.sgst.toLocaleString("en-IN")}`,
        `IGST          : ₹ ${g.igst.toLocaleString("en-IN")}`,
        `Total GST     : ₹ ${g.totalGst.toLocaleString("en-IN")}`,
        `Grand Total   : ₹ ${g.grandTotal.toLocaleString("en-IN")}`,
        `Place of Supply: ${g.placeOfSupply}`,
        `HSN           : ${g.hsn}`,
        `Buyer GSTIN   : ${g.buyerGstin}`,
        `GSTIN  : ${g.sellerGstin}`,
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
        title="GST Invoices"
        description="GST-compliant tax invoices with CGST, SGST, and IGST breakups for Indian interstate and intrastate supplies."
        breadcrumbs={[
          { label: "Documents", href: ROUTES.documents },
          { label: "GST Invoices" },
        ]}
      />

      <DocumentFiltersBar
        filters={filters}
        warehouses={facets.warehouses}
        sellers={facets.sellers}
        onChange={setFilters}
        onReset={resetFilters}
        hideType
        searchPlaceholder="Search GST invoice, GSTIN, order, PO…"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((g) => (
          <Card
            key={g.id}
            className="border-slate-200 shadow-card transition hover:border-brand/30"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base text-brand">
                  {g.invoiceNumber}
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  {g.orderNumber} · {formatDateDdMmYyyy(g.invoiceDate)}
                </p>
              </div>
              <DocumentStatusBadge status={g.status} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Metric label="GST Number" value={g.gstNumber} mono />
                <Metric label="Product" value={g.product} />
                <Metric
                  label="Taxable Value"
                  value={formatInr(g.taxableValue)}
                />
                <Metric label="CGST" value={formatInr(g.cgst)} />
                <Metric label="SGST" value={formatInr(g.sgst)} />
                <Metric label="IGST" value={formatInr(g.igst)} />
                <Metric label="Total GST" value={formatInr(g.totalGst)} />
                <Metric
                  label="Invoice Date"
                  value={formatDateDdMmYyyy(g.invoiceDate)}
                />
              </div>
              <p className="text-xs text-slate-500">
                {g.seller} · {g.warehouse} · {g.placeOfSupply}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    openPreview({
                      title: `GST Invoice ${g.invoiceNumber}`,
                      categoryLabel: "GST Invoice",
                      fileName: `${g.invoiceNumber}.pdf`,
                      documentNumber: g.invoiceNumber,
                      orderNumber: g.orderNumber,
                      content: contentFor(g),
                      relatedId: g.id,
                    });
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    simulatePdfDownload(
                      `${g.invoiceNumber}.pdf`,
                      contentFor(g),
                    );
                    markDownloaded("gst_invoice", g.id);
                    toast.success("PDF download started");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    printDocumentHtml(g.invoiceNumber, contentFor(g))
                  }
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">
          No GST invoices match your filters.
        </p>
      ) : null}
    </PageContainer>
  );
}

function Metric({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-0.5 text-xs font-semibold text-slate-900 ${mono ? "break-all font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
