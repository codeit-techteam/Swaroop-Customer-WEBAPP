"use client";

import { useMemo } from "react";
import { Download, Eye, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES, documentsInvoicePath } from "@/constants";
import {
  INVOICE_DOC_STATUS_LABELS,
  PAYMENT_DOC_STATUS_LABELS,
} from "@/constants/documents";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import {
  buildInvoiceDocumentContent,
  printDocumentHtml,
  simulatePdfDownload,
} from "@/lib/document-actions";
import {
  filterInvoices,
  getFacetOptions,
  useDocumentsStore,
} from "@/store/documentsStore";
import type { InvoiceDocument } from "@/types/documents";
import { DocumentFiltersBar } from "./DocumentFiltersBar";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import {
  DocumentsLoadingSkeleton,
  DocumentsModuleChrome,
} from "./DocumentsModuleChrome";
import { cn } from "@/lib/utils";

export function DocumentsInvoicesPage() {
  const router = useRouter();
  const isHydrated = useDocumentsStore((s) => s.isHydrated);
  const invoices = useDocumentsStore((s) => s.invoices);
  const purchaseOrders = useDocumentsStore((s) => s.purchaseOrders);
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
    () => filterInvoices(invoices, filters),
    [invoices, filters],
  );

  const preview = (inv: InvoiceDocument) => {
    openPreview({
      title: `Invoice ${inv.invoiceNumber}`,
      categoryLabel: "Tax Invoice",
      fileName: `${inv.invoiceNumber}.pdf`,
      documentNumber: inv.invoiceNumber,
      orderNumber: inv.orderNumber,
      content: buildInvoiceDocumentContent(inv),
      relatedId: inv.id,
    });
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
        title="Invoices"
        description="Tax invoices generated after commercial confirmation and payment milestones."
        breadcrumbs={[
          { label: "Documents", href: ROUTES.documents },
          { label: "Invoices" },
        ]}
      />

      <DocumentFiltersBar
        filters={filters}
        warehouses={facets.warehouses}
        sellers={facets.sellers}
        onChange={setFilters}
        onReset={resetFilters}
        hideType
        searchPlaceholder="Search invoice, order, PO, seller, warehouse…"
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>Invoice Number</TableHead>
              <TableHead>Order Number</TableHead>
              <TableHead>PO Number</TableHead>
              <TableHead>Invoice Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">GST</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Invoice Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-brand/[0.02]">
                <TableCell className="font-medium text-brand">
                  {inv.invoiceNumber}
                </TableCell>
                <TableCell>{inv.orderNumber}</TableCell>
                <TableCell>{inv.poNumber}</TableCell>
                <TableCell>{formatDateDdMmYyyy(inv.invoiceDate)}</TableCell>
                <TableCell className="text-right">
                  {formatInr(inv.amount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatInr(inv.gst)}
                </TableCell>
                <TableCell>
                  <StatusPill
                    label={PAYMENT_DOC_STATUS_LABELS[inv.paymentStatus]}
                    tone={
                      inv.paymentStatus === "paid"
                        ? "emerald"
                        : inv.paymentStatus === "overdue"
                          ? "red"
                          : "amber"
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-xs font-medium text-slate-700">
                      {INVOICE_DOC_STATUS_LABELS[inv.invoiceStatus]}
                    </span>
                    <DocumentStatusBadge status={inv.status} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-0.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg p-0"
                      title="Preview"
                      onClick={() => preview(inv)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg p-0"
                      title="View"
                      onClick={() => router.push(documentsInvoicePath(inv.id))}
                    >
                      <Eye className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg p-0"
                      title="Download PDF"
                      onClick={() => {
                        simulatePdfDownload(
                          `${inv.invoiceNumber}.pdf`,
                          buildInvoiceDocumentContent(inv),
                        );
                        markDownloaded("invoice", inv.id);
                        toast.success("PDF download started");
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg p-0"
                      title="Print"
                      onClick={() =>
                        printDocumentHtml(
                          inv.invoiceNumber,
                          buildInvoiceDocumentContent(inv),
                        )
                      }
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-slate-500">
        Showing {rows.length} of {invoices.length} invoices
      </p>
    </PageContainer>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "emerald" | "red" | "amber";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-semibold",
        tone === "emerald" &&
          "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "red" && "border-red-200 bg-red-50 text-red-800",
        tone === "amber" && "border-amber-200 bg-amber-50 text-amber-800",
      )}
    >
      {label}
    </span>
  );
}
