"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, LayoutDashboard, ListOrdered } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import {
  paymentsAdvanceTrackerPath,
  paymentsDetailPath,
} from "@/constants/payments";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";
import { PaymentStatusChip } from "./PaymentStatusChip";

interface AdvancePaymentSuccessPageProps {
  paymentId: string;
}

export function AdvancePaymentSuccessPage({
  paymentId,
}: AdvancePaymentSuccessPageProps) {
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

  return (
    <PageContainer>
      <PageHeader
        title="Submission Successful"
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "Advance Payment", href: ROUTES.payments },
          { label: "Success" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-xl"
      >
        <Card className="border-emerald-200 shadow-elevated">
          <CardContent className="flex flex-col items-center px-6 py-10 text-center">
            <motion.div
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50"
            >
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </motion.div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Payment submitted successfully
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Your payment proof has been sent for verification. Estimated
              verification time is 15–30 minutes.
            </p>
            <div className="mt-4">
              <PaymentStatusChip status={payment.status} />
            </div>
            {payment.utrNumber ? (
              <p className="mt-3 font-mono text-sm text-slate-500">
                UTR: {payment.utrNumber}
              </p>
            ) : null}

            <div className="mt-8 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                className="h-11 rounded-xl bg-brand hover:bg-brand-700"
                onClick={() =>
                  router.push(paymentsAdvanceTrackerPath(payment.id))
                }
              >
                <ListOrdered className="h-4 w-4" />
                View Payment Tracker
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl"
                onClick={() => router.push(paymentsDetailPath(payment.id))}
              >
                View Payment
              </Button>
              <Button
                variant="ghost"
                className="h-11 rounded-xl"
                onClick={() => router.push(ROUTES.payments)}
              >
                <LayoutDashboard className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageContainer>
  );
}
