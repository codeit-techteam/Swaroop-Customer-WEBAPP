"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { orderPath, statusLabel } from "@/lib/order-journey-navigation";
import { useOrdersStore } from "@/store/ordersStore";

export function OrdersListPage() {
  const router = useRouter();
  const orders = useOrdersStore((s) => s.orders);
  const isHydrated = useOrdersStore((s) => s.isHydrated);

  useEffect(() => {
    const finish = () => useOrdersStore.getState().setHydrated(true);
    const unsub = useOrdersStore.persist.onFinishHydration(finish);
    if (useOrdersStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Orders"
        description="Orders appear only after PetroTrade confirmation of a purchase request."
        breadcrumbs={[{ label: "Orders" }]}
      />

      {!isHydrated ? null : orders.length === 0 ? (
        <Card className="border-dashed border-slate-200">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <Package className="h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500">
              No orders yet. Submit a purchase request and wait for PetroTrade
              confirmation.
            </p>
            <Button
              className="rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => router.push(ROUTES.marketplace)}
            >
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {orders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer border-slate-200 transition hover:border-brand/30 hover:shadow-card"
              onClick={() => router.push(orderPath(order.id))}
            >
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-semibold">
                      {order.id}
                    </p>
                    <Badge variant="secondary">
                      {statusLabel(order.orderStatus)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">
                    {order.productName} · {formatQuantityMt(order.quantityMt)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.paymentMethodTitle} · {order.warehouse}
                  </p>
                </div>
                <p className="text-base font-semibold text-slate-900">
                  {formatInr(order.amount, { compact: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </PageContainer>
  );
}
