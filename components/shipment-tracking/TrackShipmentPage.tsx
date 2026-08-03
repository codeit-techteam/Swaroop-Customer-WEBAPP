"use client";

import { useEffect, useMemo } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { shipmentDetailPath } from "@/constants/shipment-tracking";
import { computeShipmentSummary } from "@/mock/shipment-tracking";
import {
  filterShipments,
  useShipmentTrackingStore,
} from "@/store/shipmentTrackingStore";
import { ShipmentCard } from "./ShipmentCard";
import { ShipmentFiltersBar } from "./ShipmentFiltersBar";
import { ShipmentKpiCards } from "./ShipmentKpiCards";

export function TrackShipmentPage() {
  const router = useRouter();
  const shipments = useShipmentTrackingStore((s) => s.shipments);
  const notifications = useShipmentTrackingStore((s) => s.notifications);
  const filters = useShipmentTrackingStore((s) => s.filters);
  const isHydrated = useShipmentTrackingStore((s) => s.isHydrated);
  const setFilters = useShipmentTrackingStore((s) => s.setFilters);
  const resetFilters = useShipmentTrackingStore((s) => s.resetFilters);

  useEffect(() => {
    const finish = () => useShipmentTrackingStore.getState().setHydrated(true);
    const unsub = useShipmentTrackingStore.persist.onFinishHydration(finish);
    if (useShipmentTrackingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const summary = useMemo(() => computeShipmentSummary(shipments), [shipments]);

  const rows = useMemo(
    () => filterShipments(shipments, filters),
    [shipments, filters],
  );

  const warehouses = useMemo(
    () => [...new Set(shipments.map((s) => s.warehouse))].sort(),
    [shipments],
  );
  const transporters = useMemo(
    () => [...new Set(shipments.map((s) => s.transportCompany))].sort(),
    [shipments],
  );
  const sellers = useMemo(
    () => [...new Set(shipments.map((s) => s.seller))].sort(),
    [shipments],
  );
  const destinationStates = useMemo(
    () => [...new Set(shipments.map((s) => s.destinationState))].sort(),
    [shipments],
  );

  const unread = notifications.filter((n) => !n.read).length;

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
        title="Track Shipment"
        description="Enterprise shipment dashboard for ready-for-dispatch through delivered orders across India corridors."
        breadcrumbs={[
          { label: "Shipment Tracking", href: ROUTES.shipmentTracking },
          { label: "Track Shipment" },
        ]}
        actions={
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => router.push(ROUTES.notificationsShipment)}
          >
            <Bell className="mr-2 h-4 w-4" />
            Alerts{unread ? ` (${unread})` : ""}
          </Button>
        }
      />

      <ShipmentKpiCards summary={summary} />

      <ShipmentFiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        warehouses={warehouses}
        transporters={transporters}
        sellers={sellers}
        destinationStates={destinationStates}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Shipments ({rows.length})
            </h2>
          </div>
          {rows.length === 0 ? (
            <Card className="border-dashed border-slate-200 shadow-none">
              <CardContent className="py-12 text-center text-sm text-slate-500">
                No shipments match your filters.
              </CardContent>
            </Card>
          ) : (
            rows.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))
          )}
        </div>

        <Card className="h-fit border-slate-200 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.slice(0, 6).map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => router.push(shipmentDetailPath(n.shipmentId))}
                className="w-full rounded-xl border border-slate-100 px-3 py-3 text-left transition hover:border-brand/30 hover:bg-brand/[0.02]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {n.title}
                  </p>
                  {!n.read ? (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-blue" />
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-slate-500">{n.message}</p>
              </button>
            ))}
            <Button
              variant="outline"
              className="mt-2 w-full rounded-xl"
              onClick={() => router.push(ROUTES.notificationsShipment)}
            >
              View All Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
