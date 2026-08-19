"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, RotateCcw } from "lucide-react";
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
import { OrderPaymentBadge } from "./OrderPaymentBadge";
import { OrderStatusChip } from "./OrderStatusChip";
import { OrdersFiltersBar } from "./OrdersFiltersBar";

export function DeliveredOrdersPage() {
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
        (r) => r.displayStatus === "delivered",
      ),
    [items, filters],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Delivered"
        description="Completed orders with invoice and proof of delivery."
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: "Delivered" },
        ]}
      />

      <div className="space-y-4">
        <OrdersFiltersBar
          filters={filters}
          onChange={setFilters}
          sellers={sellers}
          statusOptions={["delivered"]}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                      {formatQuantityMt(row.quantityMt)} ·{" "}
                      {"Verified Supply Partner"}
                    </p>
                  </div>
                  <OrderStatusChip status="delivered" />
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Delivered
                    </dt>
                    <dd className="font-medium">
                      {row.deliveredAt
                        ? formatDateDdMmYyyy(row.deliveredAt)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Receiver
                    </dt>
                    <dd className="font-medium">{row.receiverName ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Warehouse
                    </dt>
                    <dd className="font-medium">{row.warehouse}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Invoice
                    </dt>
                    <dd className="font-mono font-medium">
                      {row.invoiceNumber ?? "—"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[11px] uppercase text-slate-500">
                      Payment Status
                    </dt>
                    <dd className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-medium capitalize">
                        {row.paymentStatus}
                      </span>
                      <OrderPaymentBadge
                        methodId={row.paymentMethodId}
                        title={row.paymentMethodTitle}
                      />
                    </dd>
                  </div>
                </dl>

                <p className="text-sm font-semibold text-slate-900">
                  {formatInr(row.grandTotal, { compact: true })}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl"
                    onClick={() =>
                      toast.success("Invoice download queued (mock)")
                    }
                  >
                    <Download className="h-3.5 w-3.5" />
                    Invoice
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl"
                    onClick={() => toast.success("POD download queued (mock)")}
                  >
                    <Download className="h-3.5 w-3.5" />
                    POD
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl"
                    onClick={() =>
                      router.push(`${ROUTES.orderDetail}/${row.id}`)
                    }
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Details
                  </Button>
                  <Button
                    className="h-9 rounded-xl bg-brand hover:bg-brand-700"
                    onClick={() =>
                      router.push(
                        `${ROUTES.purchaseRequestsCreate}?productId=${row.productId}&qty=${row.quantityMt}`,
                      )
                    }
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reorder
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
