"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import {
  filterSortOrders,
  useOrdersCatalogStore,
} from "@/store/ordersCatalogStore";
import { OrderPaymentBadge } from "./OrderPaymentBadge";
import { OrderStatusChip } from "./OrderStatusChip";
import { OrdersFiltersBar } from "./OrdersFiltersBar";

export function ReadyForDispatchPage() {
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

  const sellers = useMemo(
    () => [...new Set(items.map((i) => i.sellerName))].sort(),
    [items],
  );

  const rows = useMemo(
    () =>
      filterSortOrders(items, filters).filter(
        (r) => r.displayStatus === "ready",
      ),
    [items, filters],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Ready for Dispatch"
        description="Orders waiting for transporter pickup at warehouse."
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: "Ready for Dispatch" },
        ]}
      />

      <div className="space-y-4">
        <OrdersFiltersBar
          filters={filters}
          onChange={setFilters}
          sellers={sellers}
          statusOptions={["ready"]}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row) => (
            <Card key={row.id} className="border-slate-200 shadow-card">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs font-semibold">{row.id}</p>
                    <p className="mt-1 text-sm font-semibold">
                      {row.productName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatQuantityMt(row.quantityMt)} · {row.warehouse}
                    </p>
                  </div>
                  <OrderStatusChip status="ready" />
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Dispatch Date
                    </dt>
                    <dd className="font-medium">
                      {row.dispatchDate
                        ? formatDateDdMmYyyy(row.dispatchDate)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Loading Slot
                    </dt>
                    <dd className="font-medium">{row.loadingSlot ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Vehicle
                    </dt>
                    <dd className="font-mono font-medium">
                      {row.vehicleNumber ?? "Assigning…"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Transport Partner
                    </dt>
                    <dd className="font-medium">{row.transporter ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Driver
                    </dt>
                    <dd className="font-medium">
                      {row.driverName ?? "—"}
                      {row.driverContact ? (
                        <span className="block text-xs text-slate-500">
                          {row.driverContact}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Amount
                    </dt>
                    <dd className="font-semibold">
                      {formatInr(row.grandTotal, { compact: true })}
                    </dd>
                  </div>
                </dl>

                <OrderPaymentBadge
                  methodId={row.paymentMethodId}
                  title={row.paymentMethodTitle}
                />

                <div className="flex flex-col gap-2">
                  <Button
                    className="h-10 w-full rounded-xl bg-brand hover:bg-brand-700"
                    onClick={() =>
                      router.push(`${ROUTES.shipmentTracking}/${row.id}`)
                    }
                  >
                    <Truck className="h-4 w-4" />
                    Track Shipment
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 w-full rounded-xl"
                    onClick={() =>
                      router.push(`${ROUTES.dispatchDetail}/${row.id}`)
                    }
                  >
                    View Dispatch Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
