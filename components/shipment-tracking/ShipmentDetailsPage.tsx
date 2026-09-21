"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FastForward, Headset } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { OrdersPageSkeleton } from "@/components/orders/orders-page-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants";
import { formatQuantityMt } from "@/lib/format";
import { formatShipmentDate } from "@/lib/shipment-mvp";
import { useShipmentTrackingStore } from "@/store/shipmentTrackingStore";
import { OrderSummarySidebar } from "./OrderSummarySidebar";
import { ShipmentStatusChip } from "./ShipmentStatusChip";
import { ShipmentVerticalTimeline } from "./ShipmentVerticalTimeline";
import { TransportDocumentsTable } from "./TransportDocumentsTable";
import { VehicleDetailsCard } from "./VehicleAndEstimateCards";

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

  if (!isHydrated || !shipment) {
    return (
      <PageContainer>
        <OrdersPageSkeleton />
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
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-sky-50/80 to-white">
              <div>
                <CardTitle className="text-base">
                  Shipment Information
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  {shipment.poNumber} · {shipment.invoiceNumber}
                </p>
              </div>
              <ShipmentStatusChip status={shipment.currentStatus} />
            </CardHeader>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <Meta label="Shipment ID" value={shipment.id} mono />
              <Meta label="Order ID" value={shipment.orderNumber} mono />
              <Meta label="PO Number" value={shipment.poNumber} mono />
              <Meta
                label="Product"
                value={`${shipment.product} (${shipment.grade})`}
              />
              <Meta
                label="Quantity"
                value={formatQuantityMt(shipment.quantityMt)}
              />
              <Meta label="Supply Source" value={shipment.seller} />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Dispatch Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Meta
                label="Dispatch Date"
                value={formatShipmentDate(shipment.dispatchDate)}
              />
              <Meta
                label="Vehicle Number"
                value={shipment.vehicleNumber}
                mono
              />
              <Meta label="Vehicle Type" value={shipment.vehicleType} />
              <Meta label="Driver" value={shipment.driverName} />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Meta label="Delivery Address" value={shipment.destination} />
              <Meta label="City" value={shipment.destination} />
              <Meta
                label="Expected Delivery Date"
                value={formatShipmentDate(
                  shipment.expectedDeliveryDate ?? shipment.eta,
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Shipment Status</CardTitle>
              <p className="text-xs text-slate-500">
                Stage-based progress — timestamps from shipment events
              </p>
            </CardHeader>
            <CardContent>
              <ShipmentVerticalTimeline stages={shipment.timeline} />
            </CardContent>
          </Card>

          <VehicleDetailsCard shipment={shipment} />

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
            : "mt-1 text-sm font-medium text-slate-800"
        }
      >
        {value}
      </p>
    </div>
  );
}
