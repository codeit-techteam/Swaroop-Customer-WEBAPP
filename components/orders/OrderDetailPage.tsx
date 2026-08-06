"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Truck, Wallet } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES, purchaseRequestsFiltered } from "@/constants";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import {
  getOrderPrimaryCtaLabel,
  getRouteAfterOrderDetails,
  orderPath,
} from "@/lib/order-journey-navigation";
import { useOrdersStore } from "@/store/ordersStore";
import { OrderStatusCard } from "./OrderStatusCard";

interface OrderDetailPageProps {
  orderId: string;
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const router = useRouter();
  const isHydrated = useOrdersStore((s) => s.isHydrated);
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));
  const selectOrder = useOrdersStore((s) => s.selectOrder);

  useEffect(() => {
    const finish = () => useOrdersStore.getState().setHydrated(true);
    const unsub = useOrdersStore.persist.onFinishHydration(finish);
    if (useOrdersStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (isHydrated && order) selectOrder(order.id);
  }, [isHydrated, order, selectOrder]);

  useEffect(() => {
    if (isHydrated && !order) {
      router.replace(ROUTES.orders);
    }
  }, [isHydrated, order, router]);

  if (!order) return null;

  return (
    <PageContainer>
      <PageHeader
        title="Order Details"
        description="Order generated after PetroTrade confirmation — track payment, dispatch and shipment."
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: order.id },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="space-y-4">
          <OrderStatusCard order={order} />

          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Shipment Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>
                Dispatch status:{" "}
                <span className="font-medium text-slate-900">
                  {order.orderStatus}
                </span>
              </p>
              <p>Expected dispatch: {order.expectedDispatch}</p>
              <p>ETA: {order.eta}</p>
              <p>Destination: {order.destination}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-brand" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 px-3 py-2">
                Invoice: {order.invoiceNumber ?? "Pending"}
              </div>
              <div className="rounded-xl border border-slate-100 px-3 py-2">
                Receipt: {order.receiptNumber ?? "Pending"}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => router.push(purchaseRequestsFiltered("approved"))}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              className="h-11 min-w-[240px] rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => router.push(getRouteAfterOrderDetails(order.id))}
            >
              <Wallet className="h-4 w-4" />
              {getOrderPrimaryCtaLabel(order)}
            </Button>
          </div>
        </div>

        <Card className="h-fit border-slate-200 lg:sticky lg:top-24">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="h-10 w-full justify-start rounded-xl"
              onClick={() => router.push(getRouteAfterOrderDetails(order.id))}
            >
              <Wallet className="h-4 w-4" />
              Payment
            </Button>
            <Button
              variant="outline"
              className="h-10 w-full justify-start rounded-xl"
              onClick={() =>
                router.push(`${ROUTES.dispatchDetail}/${order.id}`)
              }
            >
              <Truck className="h-4 w-4" />
              Dispatch
            </Button>
            <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
              Created {formatDateDdMmYyyy(order.createdAt)} ·{" "}
              {formatInr(order.amount, { compact: true })}
            </div>
            <p className="font-mono text-[11px] text-slate-400">
              {orderPath(order.id)}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </PageContainer>
  );
}
