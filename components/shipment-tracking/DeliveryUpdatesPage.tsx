"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants";
import { shipmentDetailPath } from "@/constants/shipment-tracking";
import { cn } from "@/lib/utils";
import { useShipmentTrackingStore } from "@/store/shipmentTrackingStore";
import type { DeliveryUpdateType } from "@/types/shipment-tracking";

const TYPE_META: Record<
  DeliveryUpdateType,
  { label: string; icon: typeof Info; className: string }
> = {
  info: {
    label: "Info",
    icon: Info,
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  checkpoint: {
    label: "Checkpoint",
    icon: MapPin,
    className: "border-indigo-200 bg-indigo-50 text-indigo-800",
  },
  delay: {
    label: "Delay",
    icon: AlertTriangle,
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
  reschedule: {
    label: "Reschedule",
    icon: RefreshCw,
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  alert: {
    label: "Alert",
    icon: AlertTriangle,
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

export function DeliveryUpdatesPage() {
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
  }, [queryId, setSelectedId]);

  const filterId = queryId || selectedId || "all";

  const feed = useMemo(() => {
    const list =
      filterId === "all"
        ? shipments.flatMap((s) => s.updates)
        : (shipments.find((s) => s.id === filterId)?.updates ?? []);
    return [...list].sort((a, b) => {
      const da = `${a.date} ${a.time}`;
      const db = `${b.date} ${b.time}`;
      return db.localeCompare(da);
    });
  }, [shipments, filterId]);

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
        title="Delivery Updates"
        description="Live timeline feed of warehouse exits, checkpoints, delays, and delivery confirmations."
        breadcrumbs={[
          { label: "Shipment Tracking", href: ROUTES.shipmentTracking },
          { label: "Delivery Updates" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={filterId}
          onValueChange={(id) => {
            setSelectedId(id === "all" ? null : id);
            const qs = id === "all" ? "" : `?id=${encodeURIComponent(id)}`;
            router.replace(`${ROUTES.shipmentDeliveryUpdates}${qs}`);
          }}
        >
          <SelectTrigger className="max-w-md rounded-xl">
            <SelectValue placeholder="Filter by shipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shipments</SelectItem>
            {shipments.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.orderNumber} · {s.destination}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {feed.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-slate-500">
              No delivery updates yet.
            </CardContent>
          </Card>
        ) : (
          feed.map((update) => {
            const meta = TYPE_META[update.type];
            const Icon = meta.icon;
            return (
              <Card
                key={update.id}
                className="border-slate-200 shadow-card transition hover:border-brand/25"
              >
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                        meta.className,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {update.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {update.orderNumber} · {update.date} · {update.time} ·
                        Driver {update.driver}
                        {update.location ? ` · ${update.location}` : ""}
                      </p>
                      <span
                        className={cn(
                          "mt-2 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase",
                          meta.className,
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() =>
                      router.push(shipmentDetailPath(update.shipmentId))
                    }
                  >
                    Track
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </PageContainer>
  );
}
