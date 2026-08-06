"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES, purchaseRequestsFiltered } from "@/constants";
import { usePurchaseRequestStore } from "@/store/purchaseRequestStore";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import { PurchaseRequestStepper } from "./PurchaseRequestStepper";
import { ReviewCard } from "./ReviewCard";
import { OrderSummary } from "./OrderSummary";

export function SubmitPurchaseRequestPage() {
  const router = useRouter();
  const product = usePurchaseRequestStore((s) => s.product);
  const form = usePurchaseRequestStore((s) => s.form);
  const selectedPaymentMethodId = usePurchaseRequestStore(
    (s) => s.selectedPaymentMethodId,
  );
  const acceptedTerms = usePurchaseRequestStore((s) => s.acceptedTerms);
  const acceptedGstDeclaration = usePurchaseRequestStore(
    (s) => s.acceptedGstDeclaration,
  );
  const isHydrated = usePurchaseRequestStore((s) => s.isHydrated);
  const setAcceptedTerms = usePurchaseRequestStore((s) => s.setAcceptedTerms);
  const setAcceptedGstDeclaration = usePurchaseRequestStore(
    (s) => s.setAcceptedGstDeclaration,
  );
  const submitRequest = usePurchaseRequestStore((s) => s.submitRequest);
  const startApprovalCountdown = usePurchaseRequestStore(
    (s) => s.startApprovalCountdown,
  );
  const getOrderSummary = usePurchaseRequestStore((s) => s.getOrderSummary);
  const upsertFromSubmitted = usePurchaseRequestTrackingStore(
    (s) => s.upsertFromSubmitted,
  );

  const summary = getOrderSummary();

  useEffect(() => {
    if (isHydrated && !product) {
      router.replace(ROUTES.marketplace);
    }
  }, [isHydrated, product, router]);

  if (!product || !summary) return null;

  const canSubmit = acceptedTerms && acceptedGstDeclaration;

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error("Accept terms, GST declaration and purchase agreement");
      return;
    }
    const submitted = submitRequest();
    if (!submitted) {
      toast.error("Unable to submit purchase request");
      return;
    }
    startApprovalCountdown();
    upsertFromSubmitted({
      ...submitted,
      status: "pending_approval",
    });
    toast.success("Purchase request created");
    router.push(purchaseRequestsFiltered("active"));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Submit Purchase Request"
        description="Final summary — accept terms and submit to PetroTrade."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "Payment", href: ROUTES.purchaseRequestsPayment },
          { label: "Submit" },
        ]}
      />

      <PurchaseRequestStepper currentStep="payment" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-4">
          <ReviewCard
            product={product}
            form={form}
            paymentMethodId={selectedPaymentMethodId}
            summary={summary}
            showPayment
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

          <Card className="border-slate-200">
            <CardContent className="space-y-4 p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Declarations
              </h3>
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <Checkbox
                  checked={acceptedTerms}
                  onCheckedChange={(v) => setAcceptedTerms(v === true)}
                  className="mt-0.5"
                />
                <span>
                  I accept the PetroTrade Industrial Service Terms and Purchase
                  Agreement for this request.
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <Checkbox
                  checked={acceptedGstDeclaration}
                  onCheckedChange={(v) => setAcceptedGstDeclaration(v === true)}
                  className="mt-0.5"
                />
                <span>
                  GST Declaration: I confirm the GSTIN provided is accurate and
                  that GST will be charged as applicable (18%).
                </span>
              </label>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => router.push(ROUTES.purchaseRequestsPayment)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              disabled={!canSubmit}
              className="h-11 min-w-[220px] rounded-xl bg-brand hover:bg-brand-700"
              onClick={handleSubmit}
            >
              Submit Purchase Request
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
