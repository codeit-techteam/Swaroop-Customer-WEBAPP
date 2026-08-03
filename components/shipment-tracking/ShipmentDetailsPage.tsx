"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FastForward, Headset, Package } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants";
import { formatDateDdMmYyyy, formatQuantityMt } from "@/lib/format";
import { useShipmentTrackingStore } from "@/store/shipmentTrackingStore";
import { OrderSummarySidebar } from "./OrderSummarySidebar";
import {
  LiveShipmentProgress,
  ShipmentRouteVisualization,
} from "./ShipmentRouteVisualization";
import { ShipmentStatusChip } from "./ShipmentStatusChip";
import { ShipmentVerticalTimeline } from "./ShipmentVerticalTimeline";
import { TransportDocumentsTable } from "./TransportDocumentsTable";
import {
  DeliveryEstimateCard,
  VehicleDetailsCard,
} from "./VehicleAndEstimateCards";

interface ShipmentDetailsPageProps {
  shipmentId: string;
}

export function ShipmentDetailsPage({ shipmentId }: ShipmentDetailsPageProps) {
  const router = useRouter();
  const isHydrated = useShipmentTrackingStore((s) => s.isHydrated);
  const shipment = useShipmentTrackingStore((s) =>
    s.shipments.find(
      (x) => x.id === shipmentId || x.orderNumber === shipmentId,
    ),
  );
  const advanceShipmentStatus = useShipmentTrackingStore(
    (s) => s.advanceShipmentStatus,
  );
  const markDocumentDownloaded = useShipmentTrackingStore(
    (s) => s.markDocumentDownloaded,
  );
  const setSelectedId = useShipmentTrackingStore((s) => s.setSelectedId);

  useEffect(() => {
    const finish = () => useShipmentTrackingStore.getState().setHydrated(true);
    const unsub = useShipmentTrackingStore.persist.onFinishHydration(finish);
    if (useShipmentTrackingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (shipment) setSelectedId(shipment.id);
  }, [shipment, setSelectedId]);

  useEffect(() => {
    if (isHydrated && !shipment) {
      toast.error("Shipment not found");
      router.replace(ROUTES.shipmentTracking);
    }
  }, [isHydrated, shipment, router]);

  const etaLabel = useMemo(
    () => (shipment ? formatDateDdMmYyyy(shipment.eta) : ""),
    [shipment],
  );

  if (!isHydrated || !shipment) {
    return (
      <PageContainer>
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Shipment Details"
        description={`${shipment.orderNumber} · ${shipment.product}`}
        breadcrumbs={[
          { label: "Shipment Tracking", href: ROUTES.shipmentTracking },
          { label: "Track Shipment", href: ROUTES.shipmentTracking },
          { label: shipment.orderNumber },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => router.push(ROUTES.shipmentTracking)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {shipment.currentStatus !== "delivered" ? (
              <Button
                className="rounded-xl bg-brand hover:bg-brand-700"
                onClick={() => {
                  advanceShipmentStatus(shipment.id);
                  toast.success("Shipment status advanced");
                }}
              >
                <FastForward className="mr-2 h-4 w-4" />
                Advance Status
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Summary */}
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-sky-50/80 to-white">
              <div>
                <CardTitle className="text-base">Shipment Summary</CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  {shipment.poNumber} · {shipment.invoiceNumber}
                </p>
              </div>
              <ShipmentStatusChip status={shipment.currentStatus} />
            </CardHeader>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <Meta
                label="Product"
                value={`${shipment.product} (${shipment.grade})`}
              />
              <Meta
                label="Quantity"
                value={formatQuantityMt(shipment.quantityMt)}
              />
              <Meta label="Warehouse" value={shipment.warehouse} />
              <Meta
                label="Destination"
                value={`${shipment.destination}, ${shipment.destinationState}`}
              />
              <Meta label="Payment Type" value={shipment.paymentType} />
              <Meta label="Seller" value={shipment.seller} />
              <Meta
                label="Dispatch Date"
                value={
                  shipment.dispatchDate
                    ? formatDateDdMmYyyy(shipment.dispatchDate)
                    : "Pending"
                }
              />
              <Meta label="ETA" value={etaLabel} />
            </CardContent>
            <div className="border-t border-slate-100 px-5 py-4">
              <div className="mb-2 flex justify-between text-xs text-slate-500">
                <span>Shipment progress</span>
                <span>{shipment.progress}%</span>
              </div>
              <Progress value={shipment.progress} className="h-2.5" />
            </div>
          </Card>

          {/* Shipment information */}
          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Shipment Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Meta
                label="Vehicle Number"
                value={shipment.vehicleNumber}
                mono
              />
              <Meta label="Vehicle Type" value={shipment.vehicleType} />
              <Meta
                label="Truck Capacity"
                value={`${shipment.truckCapacityMt} MT`}
              />
              <Meta
                label="Transport Company"
                value={shipment.transportCompany}
              />
              <Meta label="Driver Name" value={shipment.driverName} />
              <Meta label="Driver Mobile" value={shipment.driverMobile} />
              <Meta label="Expected Arrival" value={etaLabel} />
              <Meta
                label="Current Status"
                value={shipment.currentStatus.replaceAll("_", " ")}
              />
              <Meta label="Current City" value={shipment.currentCity} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <LiveShipmentProgress steps={shipment.liveProgress} />
            <ShipmentRouteVisualization
              route={shipment.route}
              remainingDistanceKm={shipment.remainingDistanceKm}
              etaLabel={etaLabel}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <VehicleDetailsCard shipment={shipment} />
            <DeliveryEstimateCard shipment={shipment} etaLabel={etaLabel} />
          </div>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
              <p className="text-xs text-slate-500">
                Full logistics journey from order confirmation to delivery
              </p>
            </CardHeader>
            <CardContent>
              <ShipmentVerticalTimeline stages={shipment.timeline} />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Transport Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <TransportDocumentsTable
                shipment={shipment}
                onDownloaded={(docId) =>
                  markDocumentDownloaded(shipment.id, docId)
                }
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">
                Recent Delivery Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {shipment.updates.map((u) => (
                <div
                  key={u.id}
                  className="rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {u.message}
                    </p>
                    <span className="text-xs capitalize text-slate-500">
                      {u.type}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {u.date} · {u.time} · Driver {u.driver}
                    {u.location ? ` · ${u.location}` : ""}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <OrderSummarySidebar shipment={shipment} />
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl"
                onClick={() =>
                  router.push(
                    `${ROUTES.shipmentTimeline}?id=${encodeURIComponent(shipment.id)}`,
                  )
                }
              >
                <Package className="mr-2 h-4 w-4" />
                Open Timeline View
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl"
                onClick={() =>
                  router.push(
                    `${ROUTES.shipmentDeliveryUpdates}?id=${encodeURIComponent(shipment.id)}`,
                  )
                }
              >
                Delivery Updates Feed
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl"
                onClick={() =>
                  router.push(
                    `${ROUTES.shipmentTransportDocuments}?id=${encodeURIComponent(shipment.id)}`,
                  )
                }
              >
                Transport Documents
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl"
                onClick={() =>
                  toast.message("Support ticket drafted for this shipment")
                }
              >
                <Headset className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function Meta({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={
          mono
            ? "mt-1 font-mono text-sm font-medium text-slate-800"
            : "mt-1 text-sm font-medium capitalize text-slate-800"
        }
      >
        {value}
      </p>
    </div>
  );
}
