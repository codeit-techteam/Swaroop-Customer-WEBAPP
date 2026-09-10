"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Lock,
  Package,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { BlindSellerBadge } from "@/components/marketplace/blind-seller-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES, purchaseRequestsFiltered } from "@/constants";
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import {
  getOrderPrimaryCtaLabel,
  getRouteAfterOrderDetails,
  orderPath,
  statusLabel,
} from "@/lib/order-journey-navigation";
import { useOrdersStore } from "@/store/ordersStore";

interface OrderDetailPageProps {
  orderId: string;
}

function gradeMonogram(grade: string, productName: string): string {
  const raw = (grade || productName).trim();
  const token = raw.split(/[\s/·-]+/)[0] ?? raw;
  return token.slice(0, 4).toUpperCase();
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

  const monogram = gradeMonogram(order.grade, order.productName);

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
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">Order Status</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <BlindSellerBadge compact />
                  <Badge variant="secondary">
                    {statusLabel(order.orderStatus)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-brand"
                  aria-hidden
                >
                  {monogram}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-slate-900">
                      {order.productName}
                    </p>
                    <Badge className="rounded-md border-0 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 hover:bg-emerald-50">
                      <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />
                      Verified Supply
                    </Badge>
                  </div>
                  <p className="font-mono text-xs font-medium text-slate-400">
                    {order.grade}
                    <span className="mx-1.5 text-slate-300">·</span>
                    {formatQuantityMt(order.quantityMt)}
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Lock className="h-3 w-3" aria-hidden />
                    Seller identity protected
                  </p>
                </div>
              </div>

              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                    Order Number
                  </dt>
                  <dd className="mt-1 font-mono text-sm font-semibold">
                    {order.id}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                    PO Number
                  </dt>
                  <dd className="mt-1 font-mono text-sm font-semibold">
                    {order.poNumber}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-500">
                    <Package className="h-3 w-3" aria-hidden />
                    Warehouse
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">{order.warehouse}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                    Payment
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {order.paymentMethodTitle} · {order.paymentStatus}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                    Amount Payable
                  </dt>
                  <dd className="mt-1 text-lg font-bold tabular-nums text-brand">
                    {formatInr(order.amount, { compact: true })}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Shipment Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>
                Dispatch status:{" "}
                <span className="font-medium text-slate-900">
                  {statusLabel(order.orderStatus)}
                </span>
              </p>
              <p>Expected dispatch: {order.expectedDispatch}</p>
              <p>ETA: {order.eta}</p>
              <p>Destination: {order.destination}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
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

        <Card className="h-fit border-slate-200 shadow-card lg:sticky lg:top-24">
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
