"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import {
  PROCESSING_MVP_STAGES,
  processingMvpCurrentLabel,
  processingMvpStageIndex,
} from "@/constants/order-progress";
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import {
  filterSortOrders,
  useOrdersCatalogStore,
} from "@/store/ordersCatalogStore";
import { OrderPaymentBadge } from "./OrderPaymentBadge";
import { OrderProgressTrack } from "./OrderProgressTrack";
import { OrderStatusChip } from "./OrderStatusChip";
import { OrdersFiltersBar } from "./OrdersFiltersBar";

export function ProcessingOrdersPage() {
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

  const rows = useMemo(() => {
    const scoped = filterSortOrders(items, {
      ...filters,
      status: filters.status === "all" ? "all" : filters.status,
    }).filter(
      (r) => r.displayStatus === "processing" || r.displayStatus === "packed",
    );
    return scoped;
  }, [items, filters]);

  return (
    <PageContainer>
      <PageHeader
        title="Processing"
        description="Warehouse packing progress by MVP stage — Received through Packed."
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: "Processing" },
        ]}
      />

      <div className="space-y-4">
        <OrdersFiltersBar
          filters={filters}
          onChange={setFilters}
          sellers={sellers}
          statusOptions={["processing", "packed"]}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => {
            const percent = row.processingPercent ?? row.progress;
            const stageIndex = processingMvpStageIndex(
              percent,
              row.displayStatus,
            );
            const stageLabel = processingMvpCurrentLabel(
              percent,
              row.displayStatus,
            );

            return (
              <Card key={row.id} className="border-slate-200 shadow-card">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-semibold">
                        {row.id}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {row.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatQuantityMt(row.quantityMt)} ·{" "}
                        {"Verified Supply Partner"}
                      </p>
                    </div>
                    <OrderStatusChip status={row.displayStatus} />
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <OrderProgressTrack
                      stages={PROCESSING_MVP_STAGES}
                      currentIndex={stageIndex}
                      currentLabel={stageLabel}
                    />
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-[11px] uppercase text-slate-500">
                        Warehouse
                      </dt>
                      <dd className="font-medium">{row.warehouse}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase text-slate-500">
                        Packing Team
                      </dt>
                      <dd className="font-medium">{row.packingTeam ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase text-slate-500">
                        Est. Completion
                      </dt>
                      <dd className="font-medium">
                        {row.estimatedCompletion
                          ? formatDateDdMmYyyy(row.estimatedCompletion)
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase text-slate-500">
                        Expected Dispatch
                      </dt>
                      <dd className="font-medium">
                        {row.expectedDispatch
                          ? formatDateDdMmYyyy(row.expectedDispatch)
                          : "—"}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <OrderPaymentBadge
                      methodId={row.paymentMethodId}
                      title={row.paymentMethodTitle}
                    />
                    <p className="text-sm font-semibold">
                      {formatInr(row.grandTotal, { compact: true })}
                    </p>
                  </div>

                  <Button
                    className="h-10 w-full rounded-xl bg-brand hover:bg-brand-700"
                    onClick={() =>
                      router.push(`${ROUTES.orderDetail}/${row.id}`)
                    }
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
