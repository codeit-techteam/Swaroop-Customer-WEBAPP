"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RefreshCw, Ban } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { buildValidationTimelineSteps } from "@/mock/purchase-request";
import { usePurchaseRequestStore } from "@/store/purchaseRequestStore";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useShipmentStore } from "@/store/shipmentStore";
import { useOrdersCatalogStore } from "@/store/ordersCatalogStore";
import { useApprovalStore } from "@/store/approvalStore";
import { PurchaseRequestStepper } from "./PurchaseRequestStepper";
import { ApprovalTimeline } from "./ApprovalTimeline";
import { ApprovalTimer } from "./ApprovalTimer";

export function PendingApprovalPage() {
  const router = useRouter();
  const isHydrated = usePurchaseRequestStore((s) => s.isHydrated);
  const submittedRequest = usePurchaseRequestStore((s) => s.submittedRequest);
  const requestStatus = usePurchaseRequestStore((s) => s.requestStatus);
  const approvalTimerSeconds = usePurchaseRequestStore(
    (s) => s.approvalTimerSeconds,
  );
  const validationCurrentStep = usePurchaseRequestStore(
    (s) => s.validationCurrentStep,
  );
  const validationCompletedSteps = usePurchaseRequestStore(
    (s) => s.validationCompletedSteps,
  );
  const tickApprovalTimer = usePurchaseRequestStore((s) => s.tickApprovalTimer);
  const refreshApprovalStatus = usePurchaseRequestStore(
    (s) => s.refreshApprovalStatus,
  );
  const advanceValidationStep = usePurchaseRequestStore(
    (s) => s.advanceValidationStep,
  );
  const withdrawRequest = usePurchaseRequestStore((s) => s.withdrawRequest);
  const rejectRequest = usePurchaseRequestStore((s) => s.rejectRequest);
  const startApprovalCountdown = usePurchaseRequestStore(
    (s) => s.startApprovalCountdown,
  );
  const setRejection = useApprovalStore((s) => s.setRejection);
  const buildDefaultRejection = useApprovalStore(
    (s) => s.buildDefaultRejection,
  );
  const upsertFromSubmitted = usePurchaseRequestTrackingStore(
    (s) => s.upsertFromSubmitted,
  );
  const createOrderFromPurchaseRequest = useOrdersStore(
    (s) => s.createOrderFromPurchaseRequest,
  );
  const initFromOrder = useShipmentStore((s) => s.initFromOrder);

  useEffect(() => {
    if (!isHydrated) return;
    if (!submittedRequest) {
      router.replace(ROUTES.purchaseRequestsActive);
      return;
    }
    if (requestStatus === "submitted") {
      startApprovalCountdown();
    }
  }, [
    isHydrated,
    submittedRequest,
    requestStatus,
    router,
    startApprovalCountdown,
  ]);

  useEffect(() => {
    if (requestStatus !== "pending_approval") return;
    const id = window.setInterval(() => {
      tickApprovalTimer();
    }, 1000);
    return () => window.clearInterval(id);
  }, [requestStatus, tickApprovalTimer]);

  // Demo auto-advance timeline every ~4s (mirrors mobile ORDER_CONFIRMATION_DEMO_MODE)
  useEffect(() => {
    if (requestStatus !== "pending_approval") return;
    const id = window.setInterval(() => {
      advanceValidationStep();
    }, 4000);
    return () => window.clearInterval(id);
  }, [requestStatus, advanceValidationStep]);

  useEffect(() => {
    if (requestStatus !== "approved" || !submittedRequest) return;
    const latest = usePurchaseRequestStore.getState().submittedRequest;
    if (!latest) return;
    const order = createOrderFromPurchaseRequest(latest);
    initFromOrder(order);
    upsertFromSubmitted(latest);
    useOrdersCatalogStore.getState().upsertFromCustomerOrder(order);
    toast.success("Seller approved — order generated");
    router.replace(ROUTES.purchaseRequestsApproved);
  }, [
    requestStatus,
    submittedRequest,
    createOrderFromPurchaseRequest,
    initFromOrder,
    upsertFromSubmitted,
    router,
  ]);

  if (!submittedRequest) return null;

  const timeline = buildValidationTimelineSteps(
    validationCurrentStep,
    validationCompletedSteps,
  );

  return (
    <PageContainer>
      <PageHeader
        title="Pending Seller Approval"
        description="Market price is locked while the seller reviews your request."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "Pending Approval" },
        ]}
      />

      <PurchaseRequestStepper currentStep="pending_approval" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="space-y-4">
          <ApprovalTimer
            secondsRemaining={approvalTimerSeconds}
            status={submittedRequest.priceLockStatus}
          />

          <ApprovalTimeline steps={timeline} />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="h-11 flex-1 rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => {
                refreshApprovalStatus();
                toast.message("Status refreshed");
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </Button>
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                withdrawRequest();
                toast.success("Purchase request withdrawn");
                router.push(ROUTES.purchaseRequestsActive);
              }}
            >
              <Ban className="h-4 w-4" />
              Withdraw Request
            </Button>
          </div>
          <Button
            variant="ghost"
            className="h-10 w-full rounded-xl text-slate-500"
            onClick={() => {
              if (!submittedRequest) return;
              setRejection(
                buildDefaultRejection(
                  submittedRequest.id,
                  submittedRequest.displayId,
                ),
              );
              rejectRequest();
              toast.message("Seller rejected the request (demo)");
              router.push(ROUTES.purchaseRequestsRejected);
            }}
          >
            Simulate Seller Rejection
          </Button>
        </div>

        <Card className="h-fit border-slate-200 lg:sticky lg:top-24">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Request ID</span>
              <span className="font-mono font-semibold">
                {submittedRequest.displayId}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Product</span>
              <span className="max-w-[60%] text-right font-medium">
                {submittedRequest.product.name}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Quantity</span>
              <span className="font-medium">
                {formatQuantityMt(submittedRequest.form.quantityMt)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Warehouse</span>
              <span className="font-medium">
                {submittedRequest.product.warehouse}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Payment</span>
              <span className="font-medium">
                {submittedRequest.paymentMethodTitle}
              </span>
            </div>
            <div className="flex justify-between gap-3 border-t border-slate-100 pt-3">
              <span className="text-slate-500">Grand Total</span>
              <span className="font-semibold text-slate-900">
                {formatInr(submittedRequest.summary.grandTotal, {
                  compact: true,
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageContainer>
  );
}
