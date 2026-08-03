"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROUTES } from "@/constants";
import {
  REJECTION_REASON_LABELS,
  paymentsAdvanceUploadPath,
  paymentsAdvanceVerifiedPath,
  paymentsDetailPath,
} from "@/constants/payments";
import { formatInr } from "@/lib/format";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";
import { PaymentStatusChip } from "./PaymentStatusChip";
import { PaymentTimeline } from "./PaymentTimeline";

interface AdvancePaymentTrackerPageProps {
  paymentId: string;
}

export function AdvancePaymentTrackerPage({
  paymentId,
}: AdvancePaymentTrackerPageProps) {
  const router = useRouter();
  const isHydrated = usePaymentsCatalogStore((s) => s.isHydrated);
  const payment = usePaymentsCatalogStore((s) => s.getPayment(paymentId));
  const verifyAdvancePayment = usePaymentsCatalogStore(
    (s) => s.verifyAdvancePayment,
  );
  const rejectAdvancePayment = usePaymentsCatalogStore(
    (s) => s.rejectAdvancePayment,
  );

  useEffect(() => {
    const finish = () => usePaymentsCatalogStore.getState().setHydrated(true);
    const unsub = usePaymentsCatalogStore.persist.onFinishHydration(finish);
    if (usePaymentsCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (isHydrated && !payment) router.replace(ROUTES.paymentsAdvance);
  }, [isHydrated, payment, router]);

  useEffect(() => {
    if (payment?.status === "verified" || payment?.status === "paid") {
      router.replace(paymentsAdvanceVerifiedPath(payment.id));
    }
  }, [payment, router]);

  if (!payment) return null;

  const canSimulate =
    payment.status === "verification_pending" ||
    payment.status === "payment_submitted" ||
    payment.status === "processing";

  return (
    <PageContainer>
      <PageHeader
        title="Payment Tracker"
        description="Live verification timeline for your advance payment."
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "Advance Payment", href: ROUTES.paymentsAdvance },
          { label: payment.orderNumber },
          { label: "Tracker" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="border-slate-200 shadow-card xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Verification Timeline</CardTitle>
            <PaymentStatusChip status={payment.status} />
          </CardHeader>
          <CardContent>
            <PaymentTimeline steps={payment.timeline} />
          </CardContent>
        </Card>

        <div className="space-y-4 xl:col-span-2">
          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Transaction Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Payment ID" value={payment.paymentId} />
              <Row label="Order" value={payment.orderNumber} />
              <Row label="Amount" value={formatInr(payment.totalAmount)} />
              <Row label="UTR" value={payment.utrNumber ?? "—"} mono />
              <Row label="Method" value={payment.paymentMethod ?? "—"} />
              <Row label="Txn ID" value={payment.transactionId ?? "—"} mono />
            </CardContent>
          </Card>

          {payment.status === "rejected" ||
          payment.status === "need_clarification" ? (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4" />
              <AlertTitle>
                {payment.rejection
                  ? REJECTION_REASON_LABELS[payment.rejection.reason]
                  : "Payment Rejected"}
              </AlertTitle>
              <AlertDescription>
                {payment.rejection?.message ??
                  "Your payment proof was rejected. Please upload again."}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-indigo-200 bg-indigo-50">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <AlertTitle>Finance Verification</AlertTitle>
              <AlertDescription>
                Our finance team is matching your UTR with bank credits.
                Estimated time: 15–30 minutes.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => router.push(paymentsDetailPath(payment.id))}
            >
              View Payment Details
            </Button>
            {(payment.status === "rejected" ||
              payment.status === "need_clarification") && (
              <Button
                className="h-11 rounded-xl bg-brand hover:bg-brand-700"
                onClick={() =>
                  router.push(paymentsAdvanceUploadPath(payment.id))
                }
              >
                Upload Again
              </Button>
            )}
            {canSimulate ? (
              <>
                <Button
                  className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    verifyAdvancePayment(payment.id);
                    toast.success("Payment verified");
                    router.push(paymentsAdvanceVerifiedPath(payment.id));
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Simulate Verify (Demo)
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-xl text-red-600"
                  onClick={() => {
                    rejectAdvancePayment(
                      payment.id,
                      "utr_not_found",
                      "The UTR provided does not match our bank records. Please verify and resubmit.",
                    );
                    toast.error("Payment rejected");
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Simulate Reject (Demo)
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span
        className={
          mono
            ? "font-mono text-xs font-medium text-slate-900"
            : "font-medium text-slate-900"
        }
      >
        {value}
      </span>
    </div>
  );
}
