"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Navigation } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants";
import { dispatchPath } from "@/lib/order-journey-navigation";
import {
  createDispatchDetails,
  createShipmentTimeline,
  progressForStep,
  SHIPMENT_COPY,
} from "@/mock/shipments";
import type { ShipmentTimelineStepId } from "@/types/order-journey";
import { useOrdersStore } from "@/store/ordersStore";
import { useOrdersCatalogStore } from "@/store/ordersCatalogStore";
import { useShipmentStore } from "@/store/shipmentStore";
import { DispatchInfoCard } from "@/components/dispatch/DispatchInfoCard";
import { ShipmentTimeline } from "./ShipmentTimeline";
import { DeliveryCompletedView } from "./DeliveryCompletedView";

interface ShipmentTrackingPageProps {
  orderId: string;
}

function catalogStep(status: string): ShipmentTimelineStepId {
  if (status === "delivered") return "delivered";
  if (status === "in_transit") return "in_transit";
  if (status === "ready") return "dispatched";
  return "ready";
}

export function ShipmentTrackingPage({ orderId }: ShipmentTrackingPageProps) {
  const router = useRouter();
  const isHydrated = useOrdersStore((s) => s.isHydrated);
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));
  const catalog = useOrdersCatalogStore((s) =>
    s.items.find((o) => o.id === orderId),
  );
  const shipment = useShipmentStore((s) => s.shipments[orderId]);
  const dispatch = useShipmentStore((s) => s.dispatchByOrder[orderId]);
  const delivery = useShipmentStore((s) => s.deliveryByOrder[orderId]);
  const initFromOrder = useShipmentStore((s) => s.initFromOrder);
  const advanceShipment = useShipmentStore((s) => s.advanceShipment);

  useEffect(() => {
    const finish = () => {
      useOrdersStore.getState().setHydrated(true);
      useOrdersCatalogStore.getState().setHydrated(true);
    };
    const unsub = useOrdersStore.persist.onFinishHydration(finish);
    if (useOrdersStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (isHydrated && !order && !catalog) router.replace(ROUTES.ordersActive);
  }, [isHydrated, order, catalog, router]);

  useEffect(() => {
    if (order) initFromOrder(order);
  }, [order, initFromOrder]);

  const fallbackDispatch = useMemo(() => {
    if (dispatch) return dispatch;
    if (!catalog) return null;
    return {
      ...createDispatchDetails(
        catalog.id,
        catalog.warehouse,
        catalog.expectedDispatch ?? "Within 2 Days",
      ),
      vehicleNumber: catalog.vehicleNumber ?? "MH-04-AB-2291",
      driverName: catalog.driverName ?? "Rajesh Kumar",
      driverContactMasked: catalog.driverContact ?? "+91 ******8421",
      transportPartner: catalog.transporter ?? "Verified Logistics Partner",
      currentLocation: catalog.currentLocation ?? catalog.warehouse,
      loadingStatus:
        catalog.displayStatus === "ready" ? "Ready for Loading" : "In Transit",
    };
  }, [dispatch, catalog]);

  const fallbackShipment = useMemo(() => {
    if (shipment) return shipment;
    if (!catalog) return null;
    const step = catalogStep(catalog.displayStatus);
    return {
      orderId,
      currentStep: step,
      steps: createShipmentTimeline(step),
      mapPlaceholder: true as const,
      progress: catalog.progress || progressForStep(step),
    };
  }, [shipment, catalog, orderId]);

  if ((!order && !catalog) || !fallbackShipment || !fallbackDispatch) {
    return null;
  }

  const isDelivered =
    (shipment?.currentStep === "delivered" && Boolean(delivery)) ||
    catalog?.displayStatus === "delivered";

  return (
    <PageContainer>
      <PageHeader
        title={isDelivered ? "Delivered" : SHIPMENT_COPY.headerTitle}
        description={
          isDelivered
            ? "Delivery complete — documents and next actions below."
            : "Shipment status from warehouse to destination — no live GPS map."
        }
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: orderId, href: `${ROUTES.orderDetail}/${orderId}` },
          { label: "Shipment" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {isDelivered && delivery && order ? (
          <DeliveryCompletedView
            order={order}
            delivery={delivery}
            onRateSeller={() =>
              toast.success("Delivery rating submitted (mock)")
            }
            onRepeatPurchase={() =>
              router.push(
                `${ROUTES.purchaseRequestsCreate}?productId=${order.productId}`,
              )
            }
          />
        ) : isDelivered && catalog ? (
          <Card className="border-emerald-100 bg-emerald-50/50">
            <CardContent className="space-y-3 p-6">
              <p className="text-lg font-semibold text-emerald-950">
                Shipment Delivered Successfully
              </p>
              <p className="text-sm text-emerald-800">
                {catalog.productName} · {catalog.destination} · Receiver{" "}
                {catalog.receiverName ?? "Confirmed"}
              </p>
              <Button
                className="rounded-xl bg-brand hover:bg-brand-700"
                onClick={() =>
                  router.push(`${ROUTES.orderDetail}/${catalog.id}`)
                }
              >
                View Order Details
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <DispatchInfoCard dispatch={fallbackDispatch} />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <Button
                  variant="outline"
                  className="h-11 rounded-xl"
                  onClick={() =>
                    router.push(
                      order
                        ? dispatchPath(orderId)
                        : `${ROUTES.orderDetail}/${orderId}`,
                    )
                  }
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                {order ? (
                  <Button
                    className="h-11 min-w-[200px] rounded-xl bg-brand hover:bg-brand-700"
                    onClick={() => {
                      const next = advanceShipment(orderId);
                      toast.message(`Status: ${next.replaceAll("_", " ")}`);
                    }}
                  >
                    <Navigation className="h-4 w-4" />
                    {SHIPMENT_COPY.continueLabel}
                  </Button>
                ) : (
                  <Button
                    className="h-11 min-w-[200px] rounded-xl bg-brand hover:bg-brand-700"
                    onClick={() => router.push(ROUTES.ordersInTransit)}
                  >
                    <Navigation className="h-4 w-4" />
                    View In Transit Board
                  </Button>
                )}
              </div>
            </div>

            <Card className="h-fit border-slate-200 lg:sticky lg:top-24">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Timeline</CardTitle>
                <Progress
                  value={fallbackShipment.progress}
                  className="mt-2 h-2"
                />
                <p className="text-xs text-slate-500">
                  {fallbackShipment.progress}% complete
                </p>
              </CardHeader>
              <CardContent>
                <ShipmentTimeline steps={fallbackShipment.steps} />
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
