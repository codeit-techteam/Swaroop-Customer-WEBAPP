"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Download,
  Headset,
  RotateCcw,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import {
  formatDateDdMmYyyy,
  formatInr,
  formatInrPerMt,
  formatQuantityMt,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useOrdersCatalogStore } from "@/store/ordersCatalogStore";
import { useOrdersStore } from "@/store/ordersStore";
import { OrderPaymentBadge } from "./OrderPaymentBadge";
import { OrderStatusChip } from "./OrderStatusChip";
import { OrderDetailPage as JourneyOrderDetailPage } from "./OrderDetailPage";

interface CatalogOrderDetailPageProps {
  orderId: string;
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

  if (!isCatalogHydrated && !catalogOrder) {
    return null;
  }

  if (!catalogOrder && journeyOrder) {
    return <JourneyOrderDetailPage orderId={orderId} />;
  }

  if (!catalogOrder) {
    return (
      <PageContainer>
        <PageHeader
          title="Order not found"
          description="This order ID is not in the catalog."
        />
        <Button
          className="rounded-xl"
          onClick={() => router.push(ROUTES.ordersActive)}
        >
          Back to Active Orders
        </Button>
      </PageContainer>
    );
  }

  const order = catalogOrder;

  return (
    <PageContainer>
      <PageHeader
        title="Order Details"
        description={`${order.id} · ${order.poNumber}`}
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: "Active", href: ROUTES.ordersActive },
          { label: order.id },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle className="text-base">Order Summary</CardTitle>
                <OrderStatusChip status={order.displayStatus} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-[140px_1fr]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.productImageUrl}
                alt={order.productName}
                className="h-32 w-full rounded-xl object-cover sm:h-36"
              />
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {order.productName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {order.grade} · {formatQuantityMt(order.quantityMt)}
                  </p>
                </div>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Seller
                    </dt>
                    <dd className="font-medium">{order.sellerName}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Warehouse
                    </dt>
                    <dd className="font-medium">{order.warehouse}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Price / MT
                    </dt>
                    <dd className="font-medium">
                      {formatInrPerMt(order.pricePerMt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Payment
                    </dt>
                    <dd>
                      <OrderPaymentBadge
                        methodId={order.paymentMethodId}
                        title={order.paymentMethodTitle}
                      />
                    </dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Commercial Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                ["Subtotal", order.pricePerMt * order.quantityMt],
                ["GST (18%)", order.gstAmount],
                ["Freight", order.freightAmount],
                ["Insurance", order.insuranceAmount],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="flex justify-between border-b border-slate-100 py-2"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium">
                    {formatInr(Number(value), { compact: true })}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-base font-semibold">
                <span>Grand Total</span>
                <span>{formatInr(order.grandTotal, { compact: true })}</span>
              </div>
            </CardContent>
          </Card>

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
                        <p className="text-sm font-semibold">{step.title}</p>
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

          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Shipment Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] uppercase text-slate-500">Vehicle</p>
                <p className="font-mono font-semibold">
                  {order.vehicleNumber ?? "Pending assignment"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] uppercase text-slate-500">
                  Transporter
                </p>
                <p className="font-semibold">{order.transporter ?? "—"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] uppercase text-slate-500">Driver</p>
                <p className="font-semibold">{order.driverName ?? "—"}</p>
                <p className="text-xs text-slate-500">{order.driverContact}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] uppercase text-slate-500">
                  Expected Delivery
                </p>
                <p className="font-semibold">
                  {formatDateDdMmYyyy(order.expectedDelivery)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-slate-200 shadow-card lg:sticky lg:top-24">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Invoice & Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="h-10 w-full justify-start rounded-xl"
                onClick={() => toast.success("Invoice download queued (mock)")}
              >
                <Download className="h-4 w-4" />
                Download Invoice {order.invoiceNumber ?? ""}
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
                onClick={() => router.push(ROUTES.ordersActive)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </PageContainer>
  );
}
