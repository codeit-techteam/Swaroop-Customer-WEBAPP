"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Bell } from "lucide-react";
import { CheckCircle2, PackageCheck, Truck } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { OrdersPageSkeleton } from "@/components/orders/orders-page-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { shipmentDetailPath } from "@/constants/shipment-tracking";
import { formatDateDdMmYyyy } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useShipmentTrackingStore } from "@/store/shipmentTrackingStore";
import type { ShipmentNotificationType } from "@/types/shipment-tracking";

const ICON_MAP: Record<
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

export function ShipmentNotificationsPage() {
  const router = useRouter();
  const notifications = useShipmentTrackingStore((s) => s.notifications);
  const markNotificationRead = useShipmentTrackingStore(
    (s) => s.markNotificationRead,
  );
  const markAllNotificationsRead = useShipmentTrackingStore(
    (s) => s.markAllNotificationsRead,
  );
  const isHydrated = useShipmentTrackingStore((s) => s.isHydrated);

  useEffect(() => {
    const finish = () => useShipmentTrackingStore.getState().setHydrated(true);
    const unsub = useShipmentTrackingStore.persist.onFinishHydration(finish);
    if (useShipmentTrackingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  if (!isHydrated) {
    return (
      <PageContainer>
        <OrdersPageSkeleton />
      </PageContainer>
    );
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <PageContainer>
      <PageHeader
        title="Shipment Notifications"
        description="Vehicle assigned, dispatched, in transit, out for delivery, and delivered alerts."
        breadcrumbs={[
          { label: "Shipment Tracking", href: ROUTES.shipmentTracking },
          { label: "Notifications" },
        ]}
        actions={
          unread ? (
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={markAllNotificationsRead}
            >
              Mark All Read
            </Button>
          ) : null
        }
      />

      <div className="space-y-3">
        {notifications.map((n) => {
          const meta = ICON_MAP[n.type];
          const Icon = meta.icon;
          return (
            <Card
              key={n.id}
              className={cn(
                "border-slate-200 shadow-card transition hover:border-brand/25",
                !n.read && "bg-sky-50/30",
              )}
            >
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                      meta.className,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {n.title}
                      </p>
                      {!n.read ? (
                        <span className="h-2 w-2 rounded-full bg-accent-blue" />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateDdMmYyyy(n.at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!n.read ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => markNotificationRead(n.id)}
                    >
                      Mark Read
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    className="rounded-xl bg-brand hover:bg-brand-700"
                    onClick={() => {
                      markNotificationRead(n.id);
                      router.push(shipmentDetailPath(n.shipmentId));
                    }}
                  >
                    Track Shipment
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
