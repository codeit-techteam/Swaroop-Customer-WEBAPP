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
import { ReviewCard } from "./ReviewCard";
import { OrderSummary } from "./OrderSummary";

export function ReviewPurchaseRequestPage() {
  const router = useRouter();
  const product = usePurchaseRequestStore((s) => s.product);
  const form = usePurchaseRequestStore((s) => s.form);
  const selectedPaymentMethodId = usePurchaseRequestStore(
    (s) => s.selectedPaymentMethodId,
  );
  const isHydrated = usePurchaseRequestStore((s) => s.isHydrated);
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
        title="Review Purchase Request"
        description="Confirm every detail before choosing a payment method."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "Create", href: ROUTES.purchaseRequestsCreate },
          { label: "Review" },
        ]}
      />

      <PurchaseRequestStepper currentStep="review" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-4">
          <ReviewCard
            product={product}
            form={form}
            paymentMethodId={selectedPaymentMethodId}
            summary={summary}
            showPayment={false}
            onEdit={(section) => {
              if (section === "payment") {
                router.push(ROUTES.purchaseRequestsPayment);
                return;
              }
              router.push(
                `${ROUTES.purchaseRequestsCreate}?productId=${product.id}`,
              );
            }}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() =>
                router.push(
                  `${ROUTES.purchaseRequestsCreate}?productId=${product.id}`,
                )
              }
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              className="h-11 min-w-[200px] rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => {
                setCurrentStep("payment");
                router.push(ROUTES.purchaseRequestsPayment);
              }}
            >
              Continue to Payment
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
