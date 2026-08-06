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
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import {
  buildPoDocumentContent,
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

export function PurchaseOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isHydrated = useDocumentsStore((s) => s.isHydrated);
  const purchaseOrders = useDocumentsStore((s) => s.purchaseOrders);
  const markDownloaded = useDocumentsStore((s) => s.markDownloaded);

  const po = useMemo(
    () => purchaseOrders.find((p) => p.id === params.id),
    [purchaseOrders, params.id],
  );

  if (!isHydrated) {
    return (
      <PageContainer>
        <DocumentsLoadingSkeleton />
      </PageContainer>
    );
  }

  if (!po) {
    return (
      <PageContainer>
        <PageHeader
          title="Purchase Order Not Found"
          breadcrumbs={[
            { label: "Documents", href: ROUTES.documents },
            {
              label: "Purchase Orders",
              href: ROUTES.documents,
            },
            { label: "Details" },
          ]}
        />
        <Card className="border-slate-200 shadow-card">
          <CardContent className="py-12 text-center text-sm text-slate-500">
            This purchase order is not available.{" "}
            <button
              type="button"
              className="font-semibold text-brand underline"
              onClick={() => router.push(ROUTES.documents)}
            >
              Back to list
            </button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const content = buildPoDocumentContent(po);

  return (
    <PageContainer>
      <DocumentsModuleChrome />
      <PageHeader
        title={po.poNumber}
        description={`${po.orderNumber} · ${po.product} (${po.grade}) · ${po.seller}`}
        breadcrumbs={[
          { label: "Documents", href: ROUTES.documents },
          {
            label: "Purchase Orders",
            href: ROUTES.documents,
          },
          { label: po.poNumber },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              className="rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => {
                simulatePdfDownload(`${po.poNumber}.pdf`, content);
                markDownloaded("purchase_order", po.id);
                toast.success("PDF download started");
              }}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => printDocumentHtml(po.poNumber, content)}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={async () => {
                const result = await shareDocumentText(po.poNumber, content);
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
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">PO Summary</CardTitle>
              <DocumentStatusBadge status={po.status} />
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="PO Number" value={po.poNumber} />
              <Info label="Order Number" value={po.orderNumber} />
              <Info label="PO Date" value={formatDateDdMmYyyy(po.poDate)} />
              <Info label="Product" value={`${po.product} (${po.grade})`} />
              <Info label="Warehouse" value={po.warehouse} />
              <Info label="Quantity" value={formatQuantityMt(po.quantityMt)} />
              <Info label="Amount" value={formatInr(po.amount)} />
              <Info label="Supply Source" value={po.seller} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <PartyCard title="Buyer Information" party={po.buyer} />
            <PartyCard title="Bill From" party={po.sellerInfo} />
          </div>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead>Product</TableHead>
                    <TableHead>HSN</TableHead>
                    <TableHead className="text-right">Qty (MT)</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Taxable</TableHead>
                    <TableHead className="text-right">GST</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {po.lineItems.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        {line.product} ({line.grade})
                      </TableCell>
                      <TableCell>{line.hsn}</TableCell>
                      <TableCell className="text-right">
                        {line.quantityMt}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatInr(line.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatInr(line.taxableValue)}
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
              <CardTitle className="text-base">
                Pricing · GST · Freight · Insurance
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info
                label="Taxable Value"
                value={formatInr(po.pricing.taxableValue)}
              />
              <Info
                label={`CGST (${po.pricing.gstRate / 2}%)`}
                value={formatInr(po.pricing.cgst)}
              />
              <Info
                label={`SGST (${po.pricing.gstRate / 2}%)`}
                value={formatInr(po.pricing.sgst)}
              />
              <Info
                label={`IGST (${po.pricing.igst ? po.pricing.gstRate : 0}%)`}
                value={formatInr(po.pricing.igst)}
              />
              <Info label="Freight" value={formatInr(po.pricing.freight)} />
              <Info label="Insurance" value={formatInr(po.pricing.insurance)} />
              <Info
                label="Grand Total"
                value={formatInr(po.pricing.grandTotal)}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-slate-200 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">
                {po.paymentTerms}
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Delivery Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">
                {po.deliveryTerms}
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Approval Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <Info label="Approved By" value={po.approval.approvedBy} />
              <Info
                label="Approved At"
                value={
                  po.approval.approvedAt
                    ? formatDateDdMmYyyy(po.approval.approvedAt)
                    : "—"
                }
              />
              <Info label="Remarks" value={po.approval.remarks} />
            </CardContent>
          </Card>
        </div>

        <DocumentTimeline events={po.timeline} />
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

function PartyCard({
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
    contactPerson: string;
    phone: string;
    email: string;
  };
}) {
  return (
    <Card className="border-slate-200 shadow-card">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">{party.name}</p>
        <p>GSTIN: {party.gstin}</p>
        <p>
          {party.address}, {party.city}, {party.state} — {party.pincode}
        </p>
        <p>
          {party.contactPerson} · {party.phone}
        </p>
        <p className="text-slate-500">{party.email}</p>
      </CardContent>
    </Card>
  );
}
