"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants";
import { shipmentDetailPath } from "@/constants/shipment-tracking";
import { useShipmentTrackingStore } from "@/store/shipmentTrackingStore";
import { ShipmentStatusChip } from "./ShipmentStatusChip";
import { ShipmentVerticalTimeline } from "./ShipmentVerticalTimeline";

export function ShipmentTimelinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");

  const shipments = useShipmentTrackingStore((s) => s.shipments);
  const selectedId = useShipmentTrackingStore((s) => s.selectedId);
  const setSelectedId = useShipmentTrackingStore((s) => s.setSelectedId);
  const isHydrated = useShipmentTrackingStore((s) => s.isHydrated);

  useEffect(() => {
    const finish = () => useShipmentTrackingStore.getState().setHydrated(true);
    const unsub = useShipmentTrackingStore.persist.onFinishHydration(finish);
    if (useShipmentTrackingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (queryId) setSelectedId(queryId);
    else if (!selectedId && shipments[0]) setSelectedId(shipments[0].id);
  }, [queryId, selectedId, shipments, setSelectedId]);

  const activeId = queryId || selectedId || shipments[0]?.id;
  const shipment = useMemo(
    () => shipments.find((s) => s.id === activeId),
    [shipments, activeId],
  );

  if (!isHydrated) {
    return (
      <PageContainer>
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Shipment Timeline"
        description="Stage-based shipment progress from order confirmed through delivered."
        breadcrumbs={[
          { label: "Shipment Tracking", href: ROUTES.shipmentTracking },
          { label: "Shipment Timeline" },
        ]}
        actions={
          shipment ? (
            <Button
              className="rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => router.push(shipmentDetailPath(shipment.id))}
            >
              Open Details
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={activeId}
          onValueChange={(id) => {
            setSelectedId(id);
            router.replace(
              `${ROUTES.shipmentTimeline}?id=${encodeURIComponent(id)}`,
            );
          }}
        >
          <SelectTrigger className="max-w-md rounded-xl">
            <SelectValue placeholder="Select shipment" />
          </SelectTrigger>
          <SelectContent>
            {shipments.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.orderNumber} · {s.product} · {s.destination}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {shipment ? (
          <ShipmentStatusChip status={shipment.currentStatus} />
        ) : null}
      </div>

      {shipment ? (
        <Card className="border-slate-200 shadow-card">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base">
              {shipment.orderNumber} → {shipment.destination}
            </CardTitle>
            <p className="text-xs text-slate-500">
              Order Generated → Order Confirmed → Payment Verified → Packed →
              Vehicle Assigned → Loaded → Dispatched → Checkpoints → Delivered
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <ShipmentVerticalTimeline stages={shipment.timeline} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-slate-500">
            No shipment selected.
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
