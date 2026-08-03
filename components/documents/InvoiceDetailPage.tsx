"use client";

import { useMemo } from "react";
import { Download, Printer, Share2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants";
import {
  INVOICE_DOC_STATUS_LABELS,
  PAYMENT_DOC_STATUS_LABELS,
} from "@/constants/documents";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import {
  buildInvoiceDocumentContent,
  printDocumentHtml,
  shareDocumentText,
  simulatePdfDownload,
} from "@/lib/document-actions";
import { useDocumentsStore } from "@/store/documentsStore";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { DocumentTimeline } from "./DocumentTimeline";
import {
  DocumentsLoadingSkeleton,
  DocumentsModuleChrome,
} from "./DocumentsModuleChrome";

export function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isHydrated = useDocumentsStore((s) => s.isHydrated);
  const invoices = useDocumentsStore((s) => s.invoices);
  const markDownloaded = useDocumentsStore((s) => s.markDownloaded);

  const inv = useMemo(
    () => invoices.find((i) => i.id === params.id),
    [invoices, params.id],
  );

  if (!isHydrated) {
    return (
      <PageContainer>
        <DocumentsLoadingSkeleton />
      </PageContainer>
    );
  }

  if (!inv) {
    return (
      <PageContainer>
        <PageHeader
          title="Invoice Not Found"
          breadcrumbs={[
            { label: "Documents", href: ROUTES.documents },
            { label: "Invoices", href: ROUTES.documentsInvoices },
            { label: "Details" },
          ]}
        />
        <Card className="border-slate-200 shadow-card">
          <CardContent className="py-12 text-center text-sm text-slate-500">
            Invoice not available.{" "}
            <button
              type="button"
              className="font-semibold text-brand underline"
              onClick={() => router.push(ROUTES.documentsInvoices)}
            >
              Back to invoices
            </button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const content = buildInvoiceDocumentContent(inv);

  return (
    <PageContainer>
      <DocumentsModuleChrome />
      <PageHeader
        title={inv.invoiceNumber}
        description={`${inv.orderNumber} · ${inv.poNumber} · ${inv.seller}`}
        breadcrumbs={[
          { label: "Documents", href: ROUTES.documents },
          { label: "Invoices", href: ROUTES.documentsInvoices },
          { label: inv.invoiceNumber },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              className="rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => {
                simulatePdfDownload(`${inv.invoiceNumber}.pdf`, content);
                markDownloaded("invoice", inv.id);
                toast.success("PDF download started");
              }}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => printDocumentHtml(inv.invoiceNumber, content)}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={async () => {
                const result = await shareDocumentText(
                  inv.invoiceNumber,
                  content,
                );
                toast.success(
                  result === "copied"
                    ? "Copied to clipboard"
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
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card className="overflow-hidden border-slate-200 shadow-card">
            <div className="bg-brand px-6 py-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Tax Invoice
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {inv.invoiceNumber}
              </h2>
              <p className="mt-1 text-sm text-white/80">
                {formatDateDdMmYyyy(inv.invoiceDate)} ·{" "}
                {INVOICE_DOC_STATUS_LABELS[inv.invoiceStatus]} ·{" "}
                {PAYMENT_DOC_STATUS_LABELS[inv.paymentStatus]}
              </p>
            </div>
            <CardContent className="grid gap-6 p-6 md:grid-cols-3">
              <PartyBlock title="Company Details" party={inv.company} />
              <PartyBlock title="Buyer" party={inv.buyer} />
              <PartyBlock title="Seller" party={inv.sellerInfo} />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">GST Details</CardTitle>
              <DocumentStatusBadge status={inv.status} />
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Buyer GSTIN" value={inv.buyer.gstin} />
              <Info label="Seller GSTIN" value={inv.sellerInfo.gstin} />
              <Info label="Warehouse" value={inv.warehouse} />
              <Info
                label="Order / PO"
                value={`${inv.orderNumber} / ${inv.poNumber}`}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Product Table</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead>Product</TableHead>
                    <TableHead>HSN</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inv.lineItems.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        {line.product} ({line.grade})
                      </TableCell>
                      <TableCell>{line.hsn}</TableCell>
                      <TableCell className="text-right">
                        {line.quantityMt} MT
                      </TableCell>
                      <TableCell className="text-right">
                        {formatInr(line.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatInr(line.gstAmount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatInr(line.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Totals</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info
                label="Taxable / Price"
                value={formatInr(inv.pricing.taxableValue)}
              />
              <Info label="CGST" value={formatInr(inv.pricing.cgst)} />
              <Info label="SGST" value={formatInr(inv.pricing.sgst)} />
              <Info label="IGST" value={formatInr(inv.pricing.igst)} />
              <Info label="Freight" value={formatInr(inv.pricing.freight)} />
              <Info
                label="Insurance"
                value={formatInr(inv.pricing.insurance)}
              />
              <Info
                label="Grand Total"
                value={formatInr(inv.pricing.grandTotal)}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Method" value={inv.paymentInfo.method} />
              <Info
                label="Due Date"
                value={formatDateDdMmYyyy(inv.paymentInfo.dueDate)}
              />
              <Info
                label="Paid Date"
                value={
                  inv.paymentInfo.paidDate
                    ? formatDateDdMmYyyy(inv.paymentInfo.paidDate)
                    : "—"
                }
              />
              <Info label="UTR" value={inv.paymentInfo.utr ?? "—"} />
              <Info
                label="Transaction ID"
                value={inv.paymentInfo.transactionId ?? "—"}
              />
              <Info
                label="Payment Status"
                value={PAYMENT_DOC_STATUS_LABELS[inv.paymentStatus]}
              />
            </CardContent>
          </Card>
        </div>

        <DocumentTimeline events={inv.timeline} title="Invoice Timeline" />
      </div>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function PartyBlock({
  title,
  party,
}: {
  title: string;
  party: {
    name: string;
    gstin: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{party.name}</p>
      <p className="text-xs text-slate-600">GSTIN: {party.gstin}</p>
      <p className="mt-1 text-xs text-slate-500">
        {party.address}, {party.city}, {party.state} — {party.pincode}
      </p>
    </div>
  );
}
