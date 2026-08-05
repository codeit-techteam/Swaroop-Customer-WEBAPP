"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, Printer, Share2, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import {
  PAYMENT_TYPE_LABELS,
  REJECTION_REASON_LABELS,
  paymentsAdvanceUploadPath,
} from "@/constants/payments";
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";
import { PaymentStatusChip } from "./PaymentStatusChip";
import { PaymentTimeline } from "./PaymentTimeline";

interface PaymentDetailsPageProps {
  paymentId: string;
}

export function PaymentDetailsPage({ paymentId }: PaymentDetailsPageProps) {
  const router = useRouter();
  const isHydrated = usePaymentsCatalogStore((s) => s.isHydrated);
  const payment = usePaymentsCatalogStore((s) => s.getPayment(paymentId));
  const receipts = usePaymentsCatalogStore((s) => s.receipts);
  const invoices = usePaymentsCatalogStore((s) => s.invoices);

  useEffect(() => {
    const finish = () => usePaymentsCatalogStore.getState().setHydrated(true);
    const unsub = usePaymentsCatalogStore.persist.onFinishHydration(finish);
    if (usePaymentsCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (isHydrated && !payment) router.replace(ROUTES.payments);
  }, [isHydrated, payment, router]);

  if (!payment) return null;

  const receipt = receipts.find((r) => r.paymentId === payment.paymentId);
  const invoice = invoices.find((i) => i.paymentId === payment.paymentId);

  return (
    <PageContainer>
      <PageHeader
        title="Payment Details"
        description={`${payment.paymentId} · ${payment.orderNumber}`}
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: payment.paymentId },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => toast.success("Invoice download started")}
            >
              <Download className="h-4 w-4" />
              Invoice
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => toast.success("Receipt download started")}
            >
              <FileText className="h-4 w-4" />
              Receipt
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                window.print();
              }}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied");
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
              <CardTitle className="text-base">Payment Summary</CardTitle>
              <PaymentStatusChip status={payment.status} />
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Field label="Payment ID" value={payment.paymentId} />
              <Field
                label="Payment Type"
                value={PAYMENT_TYPE_LABELS[payment.paymentType]}
              />
              <Field label="Amount" value={formatInr(payment.amount)} />
              <Field label="GST" value={formatInr(payment.gst)} />
              <Field label="Freight" value={formatInr(payment.freight)} />
              <Field label="Insurance" value={formatInr(payment.insurance)} />
              <Field
                label="Total Amount"
                value={formatInr(payment.totalAmount)}
                emphasis
              />
              <Field
                label="Due Date"
                value={formatDateDdMmYyyy(payment.dueDate)}
              />
              <Field
                label="Payment Date"
                value={
                  payment.paymentDate
                    ? formatDateDdMmYyyy(payment.paymentDate)
                    : "—"
                }
              />
              <Field
                label="Transaction ID"
                value={payment.transactionId ?? "—"}
              />
              <Field label="UTR Number" value={payment.utrNumber ?? "—"} />
              <Field
                label="Payment Reference"
                value={payment.paymentReference ?? "—"}
              />
              <Field
                label="Invoice Number"
                value={payment.invoiceNumber ?? "—"}
              />
              <Field
                label="Receipt Number"
                value={payment.receiptNumber ?? receipt?.receiptNumber ?? "—"}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Field label="Order Number" value={payment.orderNumber} />
              <Field label="PO Number" value={payment.poNumber} />
              <Field
                label="Product"
                value={`${payment.product}${payment.productGrade ? ` · ${payment.productGrade}` : ""}`}
              />
              <Field
                label="Quantity"
                value={formatQuantityMt(payment.quantityMt)}
              />
              <Field label="Supply Source" value={payment.seller} />
              <Field label="Warehouse" value={payment.warehouse} />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">GST Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <Field label="Taxable Value" value={formatInr(payment.amount)} />
              <Field label="CGST 9%" value={formatInr(payment.gst / 2)} />
              <Field label="SGST 9%" value={formatInr(payment.gst / 2)} />
            </CardContent>
          </Card>

          {(payment.proof || payment.verifiedBy || payment.rejection) && (
            <Card className="border-slate-200 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {payment.proof ? (
                  <>
                    <Field
                      label="Transaction Type"
                      value={payment.proof.transactionType}
                    />
                    <Field label="UTR" value={payment.proof.utr} />
                    <Field
                      label="Txn Date"
                      value={`${payment.proof.transactionDate} ${payment.proof.transactionTime}`}
                    />
                    <Field
                      label="Paid Amount"
                      value={formatInr(payment.proof.paidAmount)}
                    />
                    {payment.proof.screenshot ? (
                      <div className="rounded-xl border border-slate-100 p-3">
                        <p className="text-xs text-slate-400">Uploaded File</p>
                        <p className="font-medium">
                          {payment.proof.screenshot.fileName}
                        </p>
                        <p className="text-xs text-slate-500">
                          Uploaded{" "}
                          {formatDateDdMmYyyy(
                            payment.proof.screenshot.uploadedAt,
                          )}
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : null}
                {payment.verifiedBy ? (
                  <>
                    <Field label="Verified By" value={payment.verifiedBy} />
                    <Field
                      label="Verification Notes"
                      value={payment.verificationNotes ?? "—"}
                    />
                  </>
                ) : null}
                {payment.rejection ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
                    <p className="font-semibold">
                      {REJECTION_REASON_LABELS[payment.rejection.reason]}
                    </p>
                    <p className="mt-1 text-sm">{payment.rejection.message}</p>
                    <Button
                      className="mt-3 rounded-xl bg-brand hover:bg-brand-700"
                      onClick={() =>
                        router.push(paymentsAdvanceUploadPath(payment.id))
                      }
                    >
                      Upload Again
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Payment Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentTimeline steps={payment.timeline} />
            </CardContent>
          </Card>

          {invoice ? (
            <Card className="border-slate-200 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field label="Invoice" value={invoice.invoiceNumber} />
                <Field
                  label="Issue Date"
                  value={formatDateDdMmYyyy(invoice.issueDate)}
                />
                <Field label="Status" value={invoice.status} />
                <Button
                  variant="outline"
                  className="mt-2 w-full rounded-xl"
                  onClick={() => router.push(ROUTES.paymentsInvoices)}
                >
                  <Eye className="h-4 w-4" />
                  Open Invoices
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {receipt ? (
            <Card className="border-slate-200 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Receipt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field label="Receipt" value={receipt.receiptNumber} />
                <Field
                  label="Payment Date"
                  value={formatDateDdMmYyyy(receipt.paymentDate)}
                />
                <Button
                  variant="outline"
                  className="mt-2 w-full rounded-xl"
                  onClick={() => router.push(ROUTES.paymentsReceipts)}
                >
                  <Eye className="h-4 w-4" />
                  Open Receipts
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}

function Field({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={
          emphasis
            ? "text-sm font-semibold text-brand"
            : "text-sm font-medium text-slate-900"
        }
      >
        {value}
      </p>
    </div>
  );
}
