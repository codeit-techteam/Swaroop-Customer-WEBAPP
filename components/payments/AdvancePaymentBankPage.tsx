"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROUTES } from "@/constants";
import {
  paymentsAdvanceUploadPath,
  paymentsDetailPath,
} from "@/constants/payments";
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";
import { BankDetailsCard } from "./BankDetailsCard";
import { PaymentStatusChip } from "./PaymentStatusChip";

interface AdvancePaymentBankPageProps {
  paymentId: string;
}

export function AdvancePaymentBankPage({
  paymentId,
}: AdvancePaymentBankPageProps) {
  const router = useRouter();
  const isHydrated = usePaymentsCatalogStore((s) => s.isHydrated);
  const payment = usePaymentsCatalogStore((s) => s.getPayment(paymentId));

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

  const alreadySubmitted = [
    "payment_submitted",
    "verification_pending",
    "processing",
    "verified",
    "paid",
  ].includes(payment.status);

  return (
    <PageContainer>
      <PageHeader
        title="Payment Instructions"
        description="Transfer the exact advance amount using the company bank details below, then upload your UTR."
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "Advance Payment", href: ROUTES.payments },
          { label: payment.orderNumber },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="space-y-4 xl:col-span-2">
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Order Summary</CardTitle>
              <PaymentStatusChip status={payment.status} />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Order Number" value={payment.orderNumber} />
              <Row label="PO Number" value={payment.poNumber} />
              <Row label="Invoice" value={payment.invoiceNumber ?? "—"} />
              <Row
                label="Product"
                value={`${payment.product}${payment.productGrade ? ` · ${payment.productGrade}` : ""}`}
              />
              <Row label="Supply Source" value={payment.seller} />
              <Row label="Warehouse" value={payment.warehouse} />
              <Row
                label="Quantity"
                value={formatQuantityMt(payment.quantityMt)}
              />
              <div className="my-2 border-t border-slate-100" />
              <Row label="Amount" value={formatInr(payment.amount)} />
              <Row label="GST (18%)" value={formatInr(payment.gst)} />
              <Row label="Freight" value={formatInr(payment.freight)} />
              <Row label="Insurance" value={formatInr(payment.insurance)} />
              <Row
                label="Grand Total"
                value={formatInr(payment.totalAmount)}
                emphasis
              />
              <Row
                label="Payment Deadline"
                value={formatDateDdMmYyyy(payment.dueDate)}
              />
            </CardContent>
          </Card>

          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription className="space-y-1 text-amber-800">
              <p>
                Only transfer the exact amount: {formatInr(payment.totalAmount)}
                .
              </p>
              <p>
                Upload UTR after payment. Verification usually takes 15–30
                minutes.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-4 xl:col-span-3">
          <BankDetailsCard
            amountToPay={payment.totalAmount}
            deadlineLabel={formatDateDdMmYyyy(payment.dueDate)}
          />

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Payment Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
                <li>Copy beneficiary account details or scan the UPI QR.</li>
                <li>
                  Initiate NEFT / RTGS / IMPS / UPI / Corporate Banking
                  transfer.
                </li>
                <li>
                  Ensure the remitted amount matches the grand total exactly.
                </li>
                <li>Note the UTR / reference number from your bank.</li>
                <li>
                  Click “I Have Paid” and upload payment proof for verification.
                </li>
              </ol>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => router.push(ROUTES.payments)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Advance Payments
            </Button>
            {alreadySubmitted ? (
              <Button
                className="h-11 rounded-xl bg-brand hover:bg-brand-700"
                onClick={() => router.push(paymentsDetailPath(payment.id))}
              >
                <CheckCircle2 className="h-4 w-4" />
                View Payment Status
              </Button>
            ) : (
              <Button
                className="h-11 min-w-[200px] rounded-xl bg-brand hover:bg-brand-700"
                onClick={() => {
                  toast.message("Proceed to upload UTR");
                  router.push(paymentsAdvanceUploadPath(payment.id));
                }}
              >
                I Have Paid
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span
        className={
          emphasis ? "font-semibold text-brand" : "font-medium text-slate-900"
        }
      >
        {value}
      </span>
    </div>
  );
}
