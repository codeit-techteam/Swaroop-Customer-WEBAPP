"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { usePurchaseRequestStore } from "@/store/purchaseRequestStore";
import { PurchaseRequestStepper } from "./PurchaseRequestStepper";
import { PaymentSelector } from "./PaymentSelector";
import { OrderSummary } from "./OrderSummary";

export function PaymentSelectionPage() {
  const router = useRouter();
  const product = usePurchaseRequestStore((s) => s.product);
  const selectedPaymentMethodId = usePurchaseRequestStore(
    (s) => s.selectedPaymentMethodId,
  );
  const isHydrated = usePurchaseRequestStore((s) => s.isHydrated);
  const selectPayment = usePurchaseRequestStore((s) => s.selectPayment);
  const setCurrentStep = usePurchaseRequestStore((s) => s.setCurrentStep);
  const getOrderSummary = usePurchaseRequestStore((s) => s.getOrderSummary);

  const summary = getOrderSummary();

  useEffect(() => {
    if (isHydrated && !product) {
      router.replace(ROUTES.marketplace);
    }
  }, [isHydrated, product, router]);

  if (!product || !summary) return null;

  return (
    <PageContainer>
      <PageHeader
        title="Payment Method"
        description="Select payment terms. Order summary updates with discount and credit charges."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "Review", href: ROUTES.purchaseRequestsReview },
          { label: "Payment" },
        ]}
      />

      <PurchaseRequestStepper currentStep="payment" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-5">
          <PaymentSelector
            selectedMethodId={selectedPaymentMethodId}
            orderBaseAmount={summary.totalBeforePayment}
            onSelect={selectPayment}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => router.push(ROUTES.purchaseRequestsReview)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              className="h-11 min-w-[220px] rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => {
                setCurrentStep("payment");
                router.push(ROUTES.purchaseRequestsSubmit);
              }}
            >
              Continue to Submit
            </Button>
          </div>
        </div>

        <OrderSummary
          product={product}
          summary={summary}
          paymentMethodId={selectedPaymentMethodId}
        />
      </motion.div>
    </PageContainer>
  );
}
