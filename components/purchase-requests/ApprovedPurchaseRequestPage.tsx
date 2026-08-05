"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/constants";
import { orderPath } from "@/lib/order-journey-navigation";
import { useOrdersStore } from "@/store/ordersStore";
import { useShipmentStore } from "@/store/shipmentStore";
import { usePurchaseRequestStore } from "@/store/purchaseRequestStore";
import { PurchaseRequestStepper } from "./PurchaseRequestStepper";
import { OrderGeneratedCard } from "./OrderGeneratedCard";

export function ApprovedPurchaseRequestPage() {
  const router = useRouter();
  const isHydrated = usePurchaseRequestStore((s) => s.isHydrated);
  const submittedRequest = usePurchaseRequestStore((s) => s.submittedRequest);
  const requestStatus = usePurchaseRequestStore((s) => s.requestStatus);
  const approveRequest = usePurchaseRequestStore((s) => s.approveRequest);
  const createOrderFromPurchaseRequest = useOrdersStore(
    (s) => s.createOrderFromPurchaseRequest,
  );
  const initFromOrder = useShipmentStore((s) => s.initFromOrder);

  useEffect(() => {
    if (!isHydrated) return;
    if (!submittedRequest) {
      router.replace(ROUTES.marketplace);
      return;
    }
    if (requestStatus === "pending_approval" || requestStatus === "submitted") {
      approveRequest();
    }
  }, [isHydrated, submittedRequest, requestStatus, router, approveRequest]);

  useEffect(() => {
    if (requestStatus !== "approved" || !submittedRequest?.orderId) return;
    const order = createOrderFromPurchaseRequest(submittedRequest);
    initFromOrder(order);
  }, [
    requestStatus,
    submittedRequest,
    createOrderFromPurchaseRequest,
    initFromOrder,
  ]);

  if (!submittedRequest || requestStatus !== "approved") return null;

  const orderId = submittedRequest.orderId;

  return (
    <PageContainer>
      <PageHeader
        title="Order Confirmed"
        description="Purchase order generated — continue to orders and dispatch tracking."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "Approved" },
        ]}
      />

      <PurchaseRequestStepper currentStep="approved" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <OrderGeneratedCard
          request={submittedRequest}
          onGoToOrder={() => {
            if (!orderId) return;
            router.push(orderPath(orderId));
          }}
          onDownloadPdf={() => {
            toast.success("PDF download queued (mock)");
          }}
        />
      </motion.div>
    </PageContainer>
  );
}
