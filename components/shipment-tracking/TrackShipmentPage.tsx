"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, PackageCheck, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ROUTES } from "@/constants";
import { shipmentDetailPath } from "@/constants/shipment-tracking";
import {
  applyShipmentKpiFocus,
  computeShipmentSummary,
  formatShipmentDateTime,
  shipmentKpiFocusChipLabel,
  shipmentKpiFocusTitle,
} from "@/lib/shipment-mvp";
import { cn } from "@/lib/utils";
import {
  filterShipments,
  useShipmentTrackingStore,
} from "@/store/shipmentTrackingStore";
import type {
  ShipmentKpiFocus,
  ShipmentNotificationType,
} from "@/types/shipment-tracking";
import { ShipmentActiveFilterHeader } from "./ShipmentActiveFilterHeader";
import { ShipmentCard } from "./ShipmentCard";
import { ShipmentFiltersBar } from "./ShipmentFiltersBar";
import { ShipmentKpiCards } from "./ShipmentKpiCards";

const ALERT_ICON: Record<
  ShipmentNotificationType,
  { icon: typeof Bell; className: string }
> = {
  vehicle_assigned: {
    icon: Truck,
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  shipment_dispatched: {
    icon: Truck,
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  in_transit: {
    icon: Truck,
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  out_for_delivery: {
    icon: PackageCheck,
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  delivered: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

export function TrackShipmentPage() {
  const router = useRouter();
  const shipments = useShipmentTrackingStore((s) => s.shipments);
  const notifications = useShipmentTrackingStore((s) => s.notifications);
  const filters = useShipmentTrackingStore((s) => s.filters);
  const isHydrated = useShipmentTrackingStore((s) => s.isHydrated);
  const setFilters = useShipmentTrackingStore((s) => s.setFilters);
  const resetFilters = useShipmentTrackingStore((s) => s.resetFilters);
  const markNotificationRead = useShipmentTrackingStore(
    (s) => s.markNotificationRead,
  );

  const [kpiFocus, setKpiFocus] = useState<ShipmentKpiFocus>("none");
  const [alertsOpen, setAlertsOpen] = useState(false);

  useEffect(() => {
    const finish = () => useShipmentTrackingStore.getState().setHydrated(true);
    const unsub = useShipmentTrackingStore.persist.onFinishHydration(finish);
    if (useShipmentTrackingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const summary = useMemo(() => computeShipmentSummary(shipments), [shipments]);

  const rows = useMemo(() => {
    const filtered = filterShipments(shipments, filters);
    return applyShipmentKpiFocus(filtered, kpiFocus);
  }, [shipments, filters, kpiFocus]);

  const unread = notifications.filter((n) => !n.read).length;
  const recentAlerts = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
      ),
    [notifications],
  );

  const hasKpiFilter = kpiFocus !== "none";

  const openAlert = (shipmentId: string, alertId: string) => {
    markNotificationRead(alertId);
    setAlertsOpen(false);
    router.push(shipmentDetailPath(shipmentId));
  };

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
        description="Status-based shipment dashboard from ready-for-dispatch through delivered."
        breadcrumbs={[
          { label: "Shipment Tracking", href: ROUTES.shipmentTracking },
          { label: "Track Shipment" },
        ]}
        actions={
          <Popover open={alertsOpen} onOpenChange={setAlertsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-xl">
                <Bell className="mr-2 h-4 w-4" />
                Alerts{unread ? ` (${unread})` : ""}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[min(100vw-2rem,380px)] p-0"
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  Recent Shipment Updates
                </p>
                <p className="text-xs text-slate-500">
                  Operational status events only
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {recentAlerts.length === 0 ? (
                  <p className="px-2 py-6 text-center text-sm text-slate-500">
                    No alerts yet.
                  </p>
                ) : (
                  recentAlerts.map((n) => {
                    const meta = ALERT_ICON[n.type];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => openAlert(n.shipmentId, n.id)}
                        className={cn(
                          "flex w-full gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50",
                          !n.read && "bg-brand/[0.03]",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                            meta.className,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {n.title}
                            </span>
                            {!n.read ? (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-blue" />
                            ) : null}
                          </span>
                          <span className="mt-0.5 block font-mono text-[11px] text-slate-500">
                            {n.orderNumber}
                          </span>
                          <span className="mt-1 block text-xs text-slate-600">
                            {n.message}
                          </span>
                          <span className="mt-1 block text-[11px] text-slate-400">
                            {formatShipmentDateTime(n.at)}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
        }
      />

      <ShipmentKpiCards
        summary={summary}
        activeFocus={kpiFocus}
        onSelect={setKpiFocus}
      />

      <ShipmentFiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={() => {
          resetFilters();
          setKpiFocus("none");
        }}
      />

      <div className="space-y-4">
        <ShipmentActiveFilterHeader
          title={shipmentKpiFocusTitle(kpiFocus)}
          count={rows.length}
          chipLabel={shipmentKpiFocusChipLabel(kpiFocus)}
          onClearKpiFilter={
            hasKpiFilter ? () => setKpiFocus("none") : undefined
          }
        />

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
    </PageContainer>
  );
}
