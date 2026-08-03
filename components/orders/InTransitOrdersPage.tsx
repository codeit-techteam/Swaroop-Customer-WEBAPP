"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Eye, Headset } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  filterSortOrders,
  useOrdersCatalogStore,
} from "@/store/ordersCatalogStore";
import { OrderPaymentBadge } from "./OrderPaymentBadge";
import { OrderStatusChip } from "./OrderStatusChip";
import { OrdersFiltersBar } from "./OrdersFiltersBar";

const TRANSIT_STEPS = [
  "Ordered",
  "Packed",
  "Dispatched",
  "On Route",
  "Arriving",
  "Delivered",
] as const;

export function InTransitOrdersPage() {
  const router = useRouter();
  const items = useOrdersCatalogStore((s) => s.items);
  const filters = useOrdersCatalogStore((s) => s.filters);
  const setFilters = useOrdersCatalogStore((s) => s.setFilters);

  useEffect(() => {
    const finish = () => useOrdersCatalogStore.getState().setHydrated(true);
    const unsub = useOrdersCatalogStore.persist.onFinishHydration(finish);
    if (useOrdersCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const warehouses = useMemo(
    () => [...new Set(items.map((i) => i.warehouse))].sort(),
    [items],
  );
  const sellers = useMemo(
    () => [...new Set(items.map((i) => i.sellerName))].sort(),
    [items],
  );

  const rows = useMemo(
    () =>
      filterSortOrders(items, filters).filter(
        (r) => r.displayStatus === "in_transit",
      ),
    [items, filters],
  );

  return (
    <PageContainer>
      <PageHeader
        title="In Transit"
        description="Shipment progress across Indian corridors — status timeline only, no live GPS."
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: "In Transit" },
        ]}
      />

      <div className="space-y-4">
        <OrdersFiltersBar
          filters={filters}
          onChange={setFilters}
          warehouses={warehouses}
          sellers={sellers}
          statusOptions={["in_transit"]}
        />

        <div className="space-y-5">
          {rows.map((row) => {
            const stepIndex = Math.min(
              TRANSIT_STEPS.length - 2,
              Math.max(
                3,
                Math.round((row.progress / 100) * (TRANSIT_STEPS.length - 1)),
              ),
            );
            return (
              <Card
                key={row.id}
                className="overflow-hidden border-slate-200 shadow-card"
              >
                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 to-white pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">
                        {row.productName}
                      </CardTitle>
                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {row.id} · {row.poNumber} ·{" "}
                        {formatQuantityMt(row.quantityMt)}
                      </p>
                    </div>
                    <OrderStatusChip status="in_transit" />
                  </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800">
                        India corridor progress
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-1">
                        {TRANSIT_STEPS.map((step, index) => {
                          const done = index < stepIndex;
                          const current = index === stepIndex;
                          return (
                            <div
                              key={step}
                              className="flex flex-1 flex-col items-center gap-2"
                            >
                              <span
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                                  done && "bg-indigo-600 text-white",
                                  current &&
                                    "bg-indigo-500 text-white ring-4 ring-indigo-200",
                                  !done &&
                                    !current &&
                                    "border border-slate-200 bg-white text-slate-400",
                                )}
                              >
                                {done ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  index + 1
                                )}
                              </span>
                              <span className="text-center text-[10px] font-medium text-slate-600">
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <Progress value={row.progress} className="mt-4 h-2" />
                      <p className="mt-2 text-xs text-indigo-900">
                        {row.progress}% complete · {row.etaLabel}
                      </p>
                    </div>

                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <dt className="text-[11px] uppercase text-slate-500">
                          Warehouse
                        </dt>
                        <dd className="font-medium">{row.warehouse}</dd>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <dt className="text-[11px] uppercase text-slate-500">
                          Current Location
                        </dt>
                        <dd className="font-medium">
                          {row.currentLocation ?? "En route"}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <dt className="text-[11px] uppercase text-slate-500">
                          Destination
                        </dt>
                        <dd className="font-medium">{row.destination}</dd>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <dt className="text-[11px] uppercase text-slate-500">
                          Distance Remaining
                        </dt>
                        <dd className="font-medium">
                          {row.distanceRemainingKm != null
                            ? `${row.distanceRemainingKm} km`
                            : "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Transport details
                      </p>
                      <dl className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">Vehicle</dt>
                          <dd className="font-mono font-semibold">
                            {row.vehicleNumber}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">Transporter</dt>
                          <dd className="font-medium">{row.transporter}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">Driver</dt>
                          <dd className="text-right font-medium">
                            {row.driverName}
                            <span className="block text-xs text-slate-500">
                              {row.driverContact}
                            </span>
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">Value</dt>
                          <dd className="font-semibold">
                            {formatInr(row.grandTotal, { compact: true })}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-3">
                        <OrderPaymentBadge
                          methodId={row.paymentMethodId}
                          title={row.paymentMethodTitle}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        className="h-10 rounded-xl bg-brand hover:bg-brand-700"
                        onClick={() =>
                          router.push(`${ROUTES.shipmentTracking}/${row.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                        Track Shipment
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 rounded-xl"
                        onClick={() => router.push(ROUTES.support)}
                      >
                        <Headset className="h-4 w-4" />
                        Contact Support
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 rounded-xl"
                        onClick={() =>
                          toast.success("Invoice download queued (mock)")
                        }
                      >
                        <Download className="h-4 w-4" />
                        Download Invoice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
