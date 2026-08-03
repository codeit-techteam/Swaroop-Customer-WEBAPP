"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/constants";
import { useApprovalStore } from "@/store/approvalStore";
import { usePurchaseRequestStore } from "@/store/purchaseRequestStore";
import { RejectedCard } from "./RejectedCard";

export function RejectedPurchaseRequestPage() {
  const router = useRouter();
  const isHydrated = usePurchaseRequestStore((s) => s.isHydrated);
  const submittedRequest = usePurchaseRequestStore((s) => s.submittedRequest);
  const requestStatus = usePurchaseRequestStore((s) => s.requestStatus);
  const product = usePurchaseRequestStore((s) => s.product);
  const lastRejection = useApprovalStore((s) => s.lastRejection);
  const buildDefaultRejection = useApprovalStore(
    (s) => s.buildDefaultRejection,
  );
  const setRejection = useApprovalStore((s) => s.setRejection);

  useEffect(() => {
    if (!isHydrated) return;
    if (requestStatus === "rejected" && submittedRequest && !lastRejection) {
      setRejection(
        buildDefaultRejection(submittedRequest.id, submittedRequest.displayId),
      );
    }
  }, [
    isHydrated,
    requestStatus,
    submittedRequest,
    lastRejection,
    buildDefaultRejection,
    setRejection,
  ]);

  useEffect(() => {
    if (!isHydrated) return;
    if (requestStatus !== "rejected" && !lastRejection) {
      router.replace(ROUTES.purchaseRequests);
    }
  }, [isHydrated, requestStatus, lastRejection, router]);

  const rejection =
    lastRejection ??
    (submittedRequest
      ? buildDefaultRejection(submittedRequest.id, submittedRequest.displayId)
      : null);

  if (!rejection) return null;

  return (
    <PageContainer>
      <PageHeader
        title="Rejected Requests"
        description="Requests declined by the seller."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "Rejected" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <RejectedCard
          rejection={rejection}
          onModify={() => {
            router.push(
              product
                ? `${ROUTES.purchaseRequestsCreate}?productId=${product.id}`
                : ROUTES.purchaseRequestsCreate,
            );
          }}
          onBrowse={() => router.push(ROUTES.marketplace)}
        />
      </motion.div>
    </PageContainer>
  );
}
