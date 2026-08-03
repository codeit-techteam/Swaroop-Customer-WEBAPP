"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import {
  getRouteAfterPaymentProcess,
  orderPath,
} from "@/lib/order-journey-navigation";
import { PAYMENT_PROCESS_COPY } from "@/mock/payments";
import { useOrdersStore } from "@/store/ordersStore";
import { usePaymentStore } from "@/store/paymentStore";
import { useShipmentStore } from "@/store/shipmentStore";
import { PaymentCard } from "./PaymentCard";

interface PaymentProcessPageProps {
  orderId: string;
}

export function PaymentProcessPage({ orderId }: PaymentProcessPageProps) {
  const router = useRouter();
  const isHydrated = useOrdersStore((s) => s.isHydrated);
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));
  const verifyPayment = usePaymentStore((s) => s.verifyPayment);
  const verified = usePaymentStore((s) => s.isVerified(orderId));
  const initFromOrder = useShipmentStore((s) => s.initFromOrder);

  useEffect(() => {
    const finish = () => useOrdersStore.getState().setHydrated(true);
    const unsub = useOrdersStore.persist.onFinishHydration(finish);
    if (useOrdersStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (isHydrated && !order) router.replace(ROUTES.orders);
  }, [isHydrated, order, router]);

  useEffect(() => {
    if (order) initFromOrder(order);
  }, [order, initFromOrder]);

  if (!order) return null;

  const copy = PAYMENT_PROCESS_COPY[order.paymentMethodId];

  const handleContinue = () => {
    const method = order.paymentMethodId;

    if (method === "advance" || method === "on_loading") {
      verifyPayment(orderId);
      toast.success("Payment verified");
    } else if (method === "on_delivery") {
      useOrdersStore.getState().updateOrderStatus(orderId, "dispatch_ready");
      toast.message("Dispatch can proceed — payment after delivery");
    } else {
      useOrdersStore.getState().updateOrderStatus(orderId, "dispatch_ready");
      toast.message("Credit terms confirmed");
    }

    router.push(getRouteAfterPaymentProcess(method, orderId));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Payment Process"
        description="Payment UI follows the method selected on your purchase request."
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: order.id, href: orderPath(order.id) },
          { label: "Payment" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl space-y-4"
      >
        <PaymentCard order={order} verified={verified} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            className="h-11 rounded-xl"
            onClick={() => router.push(orderPath(orderId))}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            className="h-11 min-w-[220px] rounded-xl bg-brand hover:bg-brand-700"
            onClick={handleContinue}
          >
            {copy.primaryAction}
          </Button>
        </div>
      </motion.div>
    </PageContainer>
  );
}
