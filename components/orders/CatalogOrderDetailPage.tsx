"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Download,
  Headset,
  Lock,
  MapPin,
  Package,
  RotateCcw,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { BlindSellerBadge } from "@/components/marketplace/blind-seller-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER_MVP_STAGES, orderMvpStageIndex } from "@/constants/order-progress";
import { ROUTES } from "@/constants";
import {
  formatDateDdMmYyyy,
  formatEtaDisplay,
  formatInr,
  formatInrPerMt,
  formatQuantityMt,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useOrdersCatalogStore } from "@/store/ordersCatalogStore";
import { useOrdersStore } from "@/store/ordersStore";
import { OrderPaymentBadge } from "./OrderPaymentBadge";
import { OrderProgressTrack } from "./OrderProgressTrack";
import { OrderStatusChip } from "./OrderStatusChip";
import { OrderDetailPage as JourneyOrderDetailPage } from "./OrderDetailPage";

interface CatalogOrderDetailPageProps {
  orderId: string;
}

function gradeMonogram(grade: string, productName: string): string {
  const raw = (grade || productName).trim();
  const token = raw.split(/[\s/·-]+/)[0] ?? raw;
  return token.slice(0, 4).toUpperCase();
}

export function CatalogOrderDetailPage({
  orderId,
}: CatalogOrderDetailPageProps) {
  const router = useRouter();
  const catalogOrder = useOrdersCatalogStore((s) =>
    s.items.find((o) => o.id === orderId),
  );
  const journeyOrder = useOrdersStore((s) =>
    s.orders.find((o) => o.id === orderId),
  );
  const isCatalogHydrated = useOrdersCatalogStore((s) => s.isHydrated);

  useEffect(() => {
    const finish = () => useOrdersCatalogStore.getState().setHydrated(true);
    const unsub = useOrdersCatalogStore.persist.onFinishHydration(finish);
    if (useOrdersCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const commercial = useMemo(() => {
    if (!catalogOrder) return null;
    const subtotal = catalogOrder.pricePerMt * catalogOrder.quantityMt;
    const gst = catalogOrder.gstAmount;
    const freight = catalogOrder.freightAmount;
    const insurance = catalogOrder.insuranceAmount;
    const grandTotal = subtotal + gst + freight + insurance;
    return { subtotal, gst, freight, insurance, grandTotal };
  }, [catalogOrder]);

  if (!isCatalogHydrated && !catalogOrder) {
    return null;
  }

  if (!catalogOrder && journeyOrder) {
    return <JourneyOrderDetailPage orderId={orderId} />;
  }

  if (!catalogOrder || !commercial) {
    return (
      <PageContainer>
        <PageHeader
          title="Order not found"
          description="This order ID is not in the catalog."
        />
        <Button
          className="rounded-xl"
          onClick={() => router.push(ROUTES.orders)}
        >
          Back to Orders
        </Button>
      </PageContainer>
    );
  }

  const order = catalogOrder;
  const monogram = gradeMonogram(order.grade, order.productName);
  const stageIndex = orderMvpStageIndex(order.displayStatus);
  const productHref = `${ROUTES.marketplaceProduct}/${order.productId}`;

  return (
    <PageContainer>
      <PageHeader
        title="Order Details"
        description={`${order.id} · ${order.poNumber}`}
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: order.id },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-4">
          {/* Fulfillment corridor */}
          <Card className="border-slate-200 shadow-card">
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Fulfillment progress
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    PetroTrade-managed corridor · seller identity protected
                  </p>
                </div>
                <OrderStatusChip status={order.displayStatus} />
              </div>
              <OrderProgressTrack
                stages={ORDER_MVP_STAGES}
                currentIndex={stageIndex}
                currentLabel={
                  order.displayStatus === "cancelled"
                    ? "Cancelled"
                    : undefined
                }
              />
            </CardContent>
          </Card>

          {/* Order summary — data-first, no product photography */}
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle className="text-base">Order Summary</CardTitle>
                <BlindSellerBadge compact />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold tracking-tight text-brand"
                  aria-hidden
                >
                  {monogram}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={productHref}
                      className="text-lg font-semibold text-slate-900 hover:text-brand"
                    >
                      {order.productName}
                    </Link>
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
                    <Lock className="h-3 w-3 shrink-0" aria-hidden />
                    Supply source confidential until disclosure policy allows
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-right sm:min-w-[140px]">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Price / MT
                  </p>
                  <p className="mt-0.5 text-base font-bold tabular-nums text-brand">
                    {formatInrPerMt(order.pricePerMt)}
                  </p>
                </div>
              </div>

              <dl className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-100 px-3 py-2.5">
                  <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
                    <Package className="h-3 w-3" aria-hidden />
                    Handled By
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    PetroTrade Operations
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-100 px-3 py-2.5">
                  <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
                    <Warehouse className="h-3 w-3" aria-hidden />
                    Warehouse
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {order.warehouse}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-100 px-3 py-2.5">
                  <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
                    <MapPin className="h-3 w-3" aria-hidden />
                    Destination
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {order.destination}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-100 px-3 py-2.5">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                    Payment Terms
                  </dt>
                  <dd className="mt-1.5">
                    <OrderPaymentBadge
                      methodId={order.paymentMethodId}
                      title={order.paymentMethodTitle}
                    />
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-100 px-3 py-2.5">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                    Payment Status
                  </dt>
                  <dd className="mt-1 text-sm font-medium capitalize text-slate-900">
                    {order.paymentStatus.replace(/_/g, " ")}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-100 px-3 py-2.5">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                    Expected Delivery
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {formatEtaDisplay(order.expectedDelivery, order.etaLabel)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Commercial breakdown */}
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Commercial Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {(
                [
                  ["Subtotal", commercial.subtotal],
                  ["GST (18%)", commercial.gst],
                  ["Freight", commercial.freight],
                  ["Insurance", commercial.insurance],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between border-b border-slate-100 py-2.5"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium tabular-nums text-slate-900">
                    {formatInr(value, { compact: true })}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 mt-2">
                <span className="text-sm font-semibold text-slate-900">
                  Grand Total
                </span>
                <span className="text-lg font-bold tabular-nums text-brand">
                  {formatInr(commercial.grandTotal, { compact: true })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-0">
                {order.timeline.map((step, index) => {
                  const done = step.status === "completed";
                  const current = step.status === "current";
                  return (
                    <li key={step.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                            done && "bg-brand text-white",
                            current &&
                              "bg-accent-blue text-white ring-4 ring-accent-blue/15",
                            !done && !current && "bg-slate-100 text-slate-500",
                          )}
                        >
                          {done ? <Check className="h-4 w-4" /> : index + 1}
                        </span>
                        {index < order.timeline.length - 1 ? (
                          <span
                            className={cn(
                              "my-1 min-h-8 w-0.5 flex-1",
                              done ? "bg-brand" : "bg-slate-200",
                            )}
                          />
                        ) : null}
                      </div>
                      <div className="pb-5 pt-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {step.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {step.at
                            ? formatDateDdMmYyyy(step.at)
                            : current
                              ? "In progress"
                              : "Pending"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          {/* Shipment */}
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Shipment Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Vehicle
                </p>
                <p className="mt-1 font-mono font-semibold text-slate-900">
                  {order.vehicleNumber ?? "Pending assignment"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Transporter
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {order.transporter ?? "—"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Driver
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {order.driverName ?? "—"}
                </p>
                <p className="text-xs text-slate-500">{order.driverContact}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Expected Delivery
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatEtaDisplay(order.expectedDelivery, order.etaLabel)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 self-start lg:sticky lg:top-24">
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Invoice & Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="h-10 w-full justify-start rounded-xl bg-brand hover:bg-brand-700"
                onClick={() => toast.success("Invoice download queued (mock)")}
              >
                <Download className="h-4 w-4" />
                Download Invoice
                {order.invoiceNumber ? ` ${order.invoiceNumber}` : ""}
              </Button>
              <Button
                variant="outline"
                className="h-10 w-full justify-start rounded-xl"
                onClick={() =>
                  toast.success("E-Way Bill download queued (mock)")
                }
              >
                <Download className="h-4 w-4" />
                Download E-Way Bill
              </Button>
              <Button
                variant="outline"
                className="h-10 w-full justify-start rounded-xl"
                onClick={() => toast.success("PO download queued (mock)")}
              >
                <Download className="h-4 w-4" />
                Download Purchase Order
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="h-10 w-full rounded-xl bg-brand hover:bg-brand-700"
                onClick={() =>
                  router.push(`${ROUTES.shipmentTracking}/${order.id}`)
                }
              >
                <Truck className="h-4 w-4" />
                Track Shipment
              </Button>
              <Button
                variant="outline"
                className="h-10 w-full rounded-xl"
                onClick={() => router.push(ROUTES.support)}
              >
                <Headset className="h-4 w-4" />
                Raise Support Ticket
              </Button>
              <Button
                variant="outline"
                className="h-10 w-full rounded-xl"
                onClick={() =>
                  router.push(
                    `${ROUTES.purchaseRequestsCreate}?productId=${order.productId}&qty=${order.quantityMt}`,
                  )
                }
              >
                <RotateCcw className="h-4 w-4" />
                Reorder
              </Button>
              <Button
                variant="ghost"
                className="h-10 w-full rounded-xl"
                onClick={() => router.push(ROUTES.orders)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
              </Button>
            </CardContent>
          </Card>

          <p className="px-1 text-center text-[11px] leading-relaxed text-slate-400">
            Commercial documents reference PetroTrade as counterparty. Supplier
            identity stays protected per blind marketplace policy.
          </p>
        </aside>
      </motion.div>
    </PageContainer>
  );
}
