"use client";

import { useMemo } from "react";
import { Copy, Download, Eye, Printer, Share2 } from "lucide-react";
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
import { documentsPoPath } from "@/constants";
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import {
  buildPoDocumentContent,
  printDocumentHtml,
  shareDocumentText,
  simulatePdfDownload,
} from "@/lib/document-actions";
import {
  filterPurchaseOrders,
  getFacetOptions,
  useDocumentsStore,
} from "@/store/documentsStore";
import type { PurchaseOrderDocument } from "@/types/documents";
import { DocumentFiltersBar } from "./DocumentFiltersBar";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import {
  DocumentsLoadingSkeleton,
  DocumentsModuleChrome,
} from "./DocumentsModuleChrome";

export function PurchaseOrdersPage() {
  const router = useRouter();
  const isHydrated = useDocumentsStore((s) => s.isHydrated);
  const purchaseOrders = useDocumentsStore((s) => s.purchaseOrders);
  const invoices = useDocumentsStore((s) => s.invoices);
  const filters = useDocumentsStore((s) => s.filters);
  const setFilters = useDocumentsStore((s) => s.setFilters);
  const resetFilters = useDocumentsStore((s) => s.resetFilters);
  const markDownloaded = useDocumentsStore((s) => s.markDownloaded);
  const duplicatePurchaseOrder = useDocumentsStore(
    (s) => s.duplicatePurchaseOrder,
  );
  const openPreview = useDocumentsStore((s) => s.openPreview);

  const facets = useMemo(
    () => getFacetOptions({ purchaseOrders, invoices }),
    [purchaseOrders, invoices],
  );

  const rows = useMemo(
    () => filterPurchaseOrders(purchaseOrders, filters),
    [purchaseOrders, filters],
  );

  const previewPo = (po: PurchaseOrderDocument) => {
    const content = buildPoDocumentContent(po);
    openPreview({
      title: `Purchase Order ${po.poNumber}`,
      categoryLabel: "Purchase Order",
      fileName: `${po.poNumber}.pdf`,
      documentNumber: po.poNumber,
      orderNumber: po.orderNumber,
      content,
      relatedId: po.id,
    });
  };

  const downloadPo = (po: PurchaseOrderDocument) => {
    simulatePdfDownload(`${po.poNumber}.pdf`, buildPoDocumentContent(po));
    markDownloaded("purchase_order", po.id);
    toast.success(`${po.poNumber} download started`);
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
        title="Purchase Orders"
        description="Formal POs linked to approved purchase requests and PetroTrade confirmations."
        breadcrumbs={[{ label: "Documents" }]}
      />

      <DocumentFiltersBar
        filters={filters}
        warehouses={facets.warehouses}
        sellers={facets.sellers}
        onChange={setFilters}
        onReset={resetFilters}
        hideType
        searchPlaceholder="Search PO number, order, product, supply source, warehouse…"
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>PO Number</TableHead>
              <TableHead>Order Number</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Supply Source</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>PO Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  No purchase orders match your filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((po) => (
                <TableRow key={po.id} className="hover:bg-brand/[0.02]">
                  <TableCell className="font-medium text-brand">
                    {po.poNumber}
                  </TableCell>
                  <TableCell>{po.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p>{po.product}</p>
                      <p className="text-xs text-slate-400">{po.grade}</p>
                    </div>
                  </TableCell>
                  <TableCell>{po.seller}</TableCell>
                  <TableCell>{po.warehouse}</TableCell>
                  <TableCell className="text-right">
                    {formatQuantityMt(po.quantityMt)}
                  </TableCell>
                  <TableCell>{formatDateDdMmYyyy(po.poDate)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatInr(po.amount)}
                  </TableCell>
                  <TableCell>
                    <DocumentStatusBadge status={po.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-0.5">
                      <IconAction
                        label="View"
                        onClick={() => router.push(documentsPoPath(po.id))}
                      >
                        <Eye className="h-4 w-4" />
                      </IconAction>
                      <IconAction
                        label="Download PDF"
                        onClick={() => downloadPo(po)}
                      >
                        <Download className="h-4 w-4" />
                      </IconAction>
                      <IconAction
                        label="Print"
                        onClick={() =>
                          printDocumentHtml(
                            po.poNumber,
                            buildPoDocumentContent(po),
                          )
                        }
                      >
                        <Printer className="h-4 w-4" />
                      </IconAction>
                      <IconAction
                        label="Share"
                        onClick={async () => {
                          const result = await shareDocumentText(
                            po.poNumber,
                            buildPoDocumentContent(po),
                          );
                          toast.success(
                            result === "copied"
                              ? "PO details copied"
                              : result
                                ? "Shared"
                                : "Unable to share",
                          );
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </IconAction>
                      <IconAction
                        label="Duplicate"
                        onClick={() => {
                          const id = duplicatePurchaseOrder(po.id);
                          if (id) {
                            toast.success("Purchase order duplicated");
                            router.push(documentsPoPath(id));
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </IconAction>
                      <IconAction label="Preview" onClick={() => previewPo(po)}>
                        <Eye className="h-4 w-4 text-slate-400" />
                      </IconAction>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-slate-500">
        Showing {rows.length} of {purchaseOrders.length} purchase orders
      </p>
    </PageContainer>
  );
}

function IconAction({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-8 w-8 rounded-lg p-0"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}
