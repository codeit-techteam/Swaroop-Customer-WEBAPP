"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  PackageSearch,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { formatDateDdMmYyyy } from "@/lib/format";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";

interface AdvancePaymentVerifiedPageProps {
  paymentId: string;
}

export function AdvancePaymentVerifiedPage({
  paymentId,
}: AdvancePaymentVerifiedPageProps) {
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
    if (isHydrated && !payment) router.replace(ROUTES.paymentsAdvance);
  }, [isHydrated, payment, router]);

  if (!payment) return null;

  return (
    <PageContainer>
      <PageHeader
        title="Advance Payment Verified"
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "Advance Payment", href: ROUTES.paymentsAdvance },
          { label: "Verified" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <Card className="overflow-hidden border-emerald-200 shadow-elevated">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-10 text-center text-white">
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/15"
            >
              <CheckCircle2 className="h-12 w-12" />
            </motion.div>
            <h2 className="text-2xl font-semibold">Advance Payment Verified</h2>
            <p className="mt-2 text-sm text-emerald-50">
              Your payment has been verified successfully. Your order has now
              moved to Processing.
            </p>
          </div>
          <CardContent className="space-y-3 p-6 text-sm">
            <Row label="Verified By" value={payment.verifiedBy ?? "Finance"} />
            <Row
              label="Verification Time"
              value={
                payment.verifiedAt
                  ? formatDateDdMmYyyy(payment.verifiedAt)
                  : "—"
              }
            />
            <Row label="Payment ID" value={payment.paymentId} />
            <Row label="Transaction ID" value={payment.transactionId ?? "—"} />
            <Row label="UTR" value={payment.utrNumber ?? "—"} />

            <div className="flex flex-col gap-2 pt-4 sm:flex-row">
              <Button
                className="h-11 flex-1 rounded-xl bg-brand hover:bg-brand-700"
                onClick={() => router.push(ROUTES.orders)}
              >
                <ShoppingBag className="h-4 w-4" />
                Go to Orders
              </Button>
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-xl"
                onClick={() => router.push(ROUTES.ordersActive)}
              >
                <PackageSearch className="h-4 w-4" />
                Track Order
              </Button>
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-xl"
                onClick={() => {
                  toast.success("Receipt download started");
                  router.push(ROUTES.paymentsReceipts);
                }}
              >
                <Download className="h-4 w-4" />
                Download Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
