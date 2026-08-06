"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, ShoppingBag, Route } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES, purchaseRequestsFiltered } from "@/constants";
import { formatQuantityMt } from "@/lib/format";
import { usePurchaseRequestStore } from "@/store/purchaseRequestStore";
import { PurchaseRequestStepper } from "./PurchaseRequestStepper";
import { SuccessCard } from "./SuccessCard";

export function SubmittedPurchaseRequestPage() {
  const router = useRouter();
  const isHydrated = usePurchaseRequestStore((s) => s.isHydrated);
  const submittedRequest = usePurchaseRequestStore((s) => s.submittedRequest);
  const startApprovalCountdown = usePurchaseRequestStore(
    (s) => s.startApprovalCountdown,
  );

  useEffect(() => {
    if (isHydrated && !submittedRequest) {
      router.replace(purchaseRequestsFiltered("active"));
    }
  }, [isHydrated, submittedRequest, router]);

  if (!submittedRequest) return null;

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Request Submitted"
        description="Your request is with PetroTrade for approval."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "Submitted" },
        ]}
      />

      <PurchaseRequestStepper currentStep="submitted" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl space-y-4"
      >
        <SuccessCard
          requestId={submittedRequest.displayId}
          subtitle="PetroTrade has 15 minutes to review your request."
        >
          <Card className="border-slate-200 text-left shadow-none">
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase text-slate-500">Product</p>
                <p className="text-sm font-medium text-slate-900">
                  {submittedRequest.product.name}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-slate-500">Quantity</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatQuantityMt(submittedRequest.form.quantityMt)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-slate-500">
                  Warehouse
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {submittedRequest.product.warehouse}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-slate-500">Status</p>
                <p className="text-sm font-medium text-slate-900">Submitted</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-slate-500">
                  Submitted
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(submittedRequest.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-slate-500">Payment</p>
                <p className="text-sm font-medium text-slate-900">
                  {submittedRequest.paymentMethodTitle}
                </p>
              </div>
            </CardContent>
          </Card>
        </SuccessCard>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="h-11 flex-1 rounded-xl bg-brand hover:bg-brand-700"
            onClick={() => {
              startApprovalCountdown();
              router.push(ROUTES.purchaseRequestsPendingLive);
            }}
          >
            <Route className="h-4 w-4" />
            Track Request
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-xl"
            onClick={() => router.push(ROUTES.purchaseRequests)}
          >
            <LayoutDashboard className="h-4 w-4" />
            Go Purchase Requests
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-xl"
            onClick={() => router.push(ROUTES.marketplace)}
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>
        </div>
      </motion.div>
    </PageContainer>
  );
}
