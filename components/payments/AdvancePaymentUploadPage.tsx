"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROUTES } from "@/constants";
import {
  paymentsAdvancePayPath,
  paymentsAdvanceSuccessPath,
} from "@/constants/payments";
import { formatInr } from "@/lib/format";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";
import type { UploadProofFormState } from "@/types/payments";
import { UploadProofForm, validateUploadForm } from "./UploadProofForm";

interface AdvancePaymentUploadPageProps {
  paymentId: string;
}

export function AdvancePaymentUploadPage({
  paymentId,
}: AdvancePaymentUploadPageProps) {
  const router = useRouter();
  const isHydrated = usePaymentsCatalogStore((s) => s.isHydrated);
  const payment = usePaymentsCatalogStore((s) => s.getPayment(paymentId));
  const createEmptyUploadForm = usePaymentsCatalogStore(
    (s) => s.createEmptyUploadForm,
  );
  const submitAdvanceProof = usePaymentsCatalogStore(
    (s) => s.submitAdvanceProof,
  );

  const [form, setForm] = useState<UploadProofFormState | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof UploadProofFormState, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const finish = () => usePaymentsCatalogStore.getState().setHydrated(true);
    const unsub = usePaymentsCatalogStore.persist.onFinishHydration(finish);
    if (usePaymentsCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (isHydrated && !payment) router.replace(ROUTES.payments);
  }, [isHydrated, payment, router]);

  useEffect(() => {
    if (payment && !form) {
      setForm(createEmptyUploadForm(payment));
    }
  }, [payment, form, createEmptyUploadForm]);

  if (!payment || !form) return null;

  const onSubmit = () => {
    const nextErrors = validateUploadForm(form, payment.totalAmount);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the form errors");
      return;
    }
    setSubmitting(true);
    submitAdvanceProof(payment.id, {
      transactionType: form.transactionType,
      utr: form.utr,
      transactionDate: form.transactionDate,
      transactionTime: form.transactionTime,
      paidAmount: form.paidAmount,
      remarks: form.remarks || undefined,
      screenshot: form.screenshot ?? undefined,
      receipt: form.receipt ?? undefined,
      bankAdvice: form.bankAdvice ?? undefined,
      submittedAt: new Date().toISOString(),
    });
    toast.success("Payment proof submitted");
    router.push(paymentsAdvanceSuccessPath(payment.id));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Upload Payment Proof"
        description="Submit UTR and supporting documents for finance verification."
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "Advance Payment", href: ROUTES.payments },
          {
            label: payment.orderNumber,
            href: paymentsAdvancePayPath(payment.id),
          },
          { label: "Upload UTR" },
        ]}
      />

      <Alert className="border-sky-200 bg-sky-50">
        <AlertTitle>Amount to confirm</AlertTitle>
        <AlertDescription>
          Paying {formatInr(payment.totalAmount)} for {payment.orderNumber}.
          Verification typically completes in 15–30 minutes.
        </AlertDescription>
      </Alert>

      <Card className="border-slate-200 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadProofForm
            form={form}
            errors={errors}
            onChange={(patch) => setForm((f) => (f ? { ...f, ...patch } : f))}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          className="h-11 rounded-xl"
          onClick={() => router.push(paymentsAdvancePayPath(payment.id))}
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          className="h-11 min-w-[220px] rounded-xl bg-brand hover:bg-brand-700"
          disabled={submitting}
          onClick={onSubmit}
        >
          <Send className="h-4 w-4" />
          Submit For Verification
        </Button>
      </div>
    </PageContainer>
  );
}
