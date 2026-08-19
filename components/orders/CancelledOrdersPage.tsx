"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";
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
import { OrderStatusChip } from "./OrderStatusChip";
import { OrdersFiltersBar } from "./OrdersFiltersBar";

export function CancelledOrdersPage() {
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
        (r) => r.displayStatus === "cancelled",
      ),
    [items, filters],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Cancelled"
        description="Cancelled orders with reason, actor and refund status."
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: "Cancelled" },
        ]}
      />

      <div className="space-y-4">
        <OrdersFiltersBar
          filters={filters}
          onChange={setFilters}
          sellers={sellers}
          statusOptions={["cancelled"]}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row) => (
            <Card key={row.id} className="border-red-100 shadow-card">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs font-semibold">{row.id}</p>
                    <p className="mt-1 text-sm font-semibold">
                      {row.productName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatQuantityMt(row.quantityMt)} ·{" "}
                      {"Verified Supply Partner"}
                    </p>
                  </div>
                  <OrderStatusChip status="cancelled" />
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Cancelled Date
                    </dt>
                    <dd className="font-medium">
                      {row.cancelledAt
                        ? formatDateDdMmYyyy(row.cancelledAt)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Cancelled By
                    </dt>
                    <dd className="font-medium">{row.cancelledBy ?? "—"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[11px] uppercase text-slate-500">
                      Reason
                    </dt>
                    <dd className="mt-1 rounded-xl bg-red-50 p-3 text-sm text-red-900">
                      {row.cancellationReason ?? "—"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[11px] uppercase text-slate-500">
                      Refund Status
                    </dt>
                    <dd className="font-medium">{row.refundStatus ?? "—"}</dd>
                  </div>
                </dl>

                <p className="text-sm font-semibold">
                  {formatInr(row.grandTotal, { compact: true })}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="h-10 flex-1 rounded-xl"
                    onClick={() =>
                      router.push(`${ROUTES.orderDetail}/${row.id}`)
                    }
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 flex-1 rounded-xl"
                    onClick={() =>
                      toast.success("Cancellation note download queued (mock)")
                    }
                  >
                    <Download className="h-4 w-4" />
                    Cancellation Note
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
