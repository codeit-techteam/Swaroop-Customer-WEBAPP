"use client";

import { useMemo } from "react";
import { Download, Eye, FileInput } from "lucide-react";
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
import { PROFORMA_STATUS_LABELS } from "@/constants/documents";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import {
  buildGenericDocumentContent,
  simulatePdfDownload,
} from "@/lib/document-actions";
import {
  filterProformas,
  getFacetOptions,
  useDocumentsStore,
} from "@/store/documentsStore";
import type { ProformaInvoiceDocument } from "@/types/documents";
import { DocumentFiltersBar } from "./DocumentFiltersBar";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import {
  DocumentsLoadingSkeleton,
  DocumentsModuleChrome,
} from "./DocumentsModuleChrome";
import { cn } from "@/lib/utils";

export function ProformaInvoicesPage() {
  const router = useRouter();
  const isHydrated = useDocumentsStore((s) => s.isHydrated);
  const proformas = useDocumentsStore((s) => s.proformas);
  const purchaseOrders = useDocumentsStore((s) => s.purchaseOrders);
  const invoices = useDocumentsStore((s) => s.invoices);
  const filters = useDocumentsStore((s) => s.filters);
  const setFilters = useDocumentsStore((s) => s.setFilters);
  const resetFilters = useDocumentsStore((s) => s.resetFilters);
  const markDownloaded = useDocumentsStore((s) => s.markDownloaded);
  const convertProformaToInvoice = useDocumentsStore(
    (s) => s.convertProformaToInvoice,
  );
  const openPreview = useDocumentsStore((s) => s.openPreview);

  const facets = useMemo(
    () => getFacetOptions({ purchaseOrders, invoices }),
    [purchaseOrders, invoices],
  );
  const rows = useMemo(
    () => filterProformas(proformas, filters),
    [proformas, filters],
  );

  const preview = (pi: ProformaInvoiceDocument) => {
    openPreview({
      title: `Proforma ${pi.proformaNumber}`,
      categoryLabel: "Proforma Invoice",
      fileName: `${pi.proformaNumber}.pdf`,
      documentNumber: pi.proformaNumber,
      orderNumber: pi.orderNumber,
      content: buildGenericDocumentContent({
        title: "Proforma Invoice",
        documentNumber: pi.proformaNumber,
        orderNumber: pi.orderNumber,
        seller: pi.seller,
        warehouse: pi.warehouse,
        product: `${pi.product} (${pi.grade})`,
        extraLines: [
          `Amount        : ₹ ${pi.amount.toLocaleString("en-IN")}`,
          `Created       : ${pi.createdDate}`,
          `Expiry        : ${pi.expiryDate}`,
          `Status        : ${pi.status}`,
          `Payment Terms : ${pi.paymentTerms}`,
          `Validity      : ${pi.validityNote}`,
        ],
      }),
      relatedId: pi.id,
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
        title="Proforma Invoice"
        description="Commercial proforma invoices pending conversion to tax invoices."
        breadcrumbs={[
          { label: "Documents", href: ROUTES.documents },
          { label: "Proforma Invoice" },
        ]}
      />

      <DocumentFiltersBar
        filters={filters}
        warehouses={facets.warehouses}
        sellers={facets.sellers}
        onChange={setFilters}
        onReset={resetFilters}
        hideType
        searchPlaceholder="Search proforma, order, product, seller…"
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>Proforma Number</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((pi) => (
              <TableRow key={pi.id} className="hover:bg-brand/[0.02]">
                <TableCell className="font-medium text-brand">
                  {pi.proformaNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p>{pi.product}</p>
                    <p className="text-xs text-slate-400">{pi.grade}</p>
                  </div>
                </TableCell>
                <TableCell>{pi.orderNumber}</TableCell>
                <TableCell className="text-right">
                  {formatInr(pi.amount)}
                </TableCell>
                <TableCell>{formatDateDdMmYyyy(pi.createdDate)}</TableCell>
                <TableCell>{formatDateDdMmYyyy(pi.expiryDate)}</TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <span
                      className={cn(
                        "inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-semibold",
                        pi.status === "active" &&
                          "border-sky-200 bg-sky-50 text-sky-800",
                        pi.status === "converted" &&
                          "border-emerald-200 bg-emerald-50 text-emerald-800",
                        pi.status === "expired" &&
                          "border-amber-200 bg-amber-50 text-amber-800",
                        pi.status === "cancelled" &&
                          "border-slate-200 bg-slate-100 text-slate-600",
                      )}
                    >
                      {PROFORMA_STATUS_LABELS[pi.status]}
                    </span>
                    <DocumentStatusBadge status={pi.docStatus} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-0.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg p-0"
                      title="Preview"
                      onClick={() => preview(pi)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg p-0"
                      title="Download"
                      onClick={() => {
                        simulatePdfDownload(
                          `${pi.proformaNumber}.pdf`,
                          buildGenericDocumentContent({
                            title: "Proforma Invoice",
                            documentNumber: pi.proformaNumber,
                            orderNumber: pi.orderNumber,
                            seller: pi.seller,
                            warehouse: pi.warehouse,
                            product: pi.product,
                          }),
                        );
                        markDownloaded("proforma", pi.id);
                        toast.success("Download started");
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg px-2"
                      title="Convert to Invoice"
                      disabled={
                        pi.status === "converted" || pi.status === "cancelled"
                      }
                      onClick={() => {
                        const invId = convertProformaToInvoice(pi.id);
                        if (invId) {
                          toast.success("Converted to tax invoice");
                          router.push(documentsInvoicePath(invId));
                        } else {
                          toast.error("Unable to convert this proforma");
                        }
                      }}
                    >
                      <FileInput className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}
