"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Clock3,
  Download,
  Eye,
  Headset,
  IndianRupee,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants";
import {
  ORDER_MVP_STAGES,
  orderMvpStageIndex,
} from "@/constants/order-progress";
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import { ACTIVE_ORDER_STATUSES } from "@/mock/orders-catalog";
import {
  filterSortOrders,
  useOrdersCatalogStore,
} from "@/store/ordersCatalogStore";
import { AvgDeliveryTimeCard } from "./AvgDeliveryTimeCard";
import { OrderPaymentBadge } from "./OrderPaymentBadge";
import { OrderProgressTrack } from "./OrderProgressTrack";
import { OrderStatusChip } from "./OrderStatusChip";
import { OrdersFiltersBar } from "./OrdersFiltersBar";
import { formatKpiValue, OrdersKpiCards } from "./OrdersKpiCards";
import { OrdersPagination } from "./OrdersPagination";

export function ActiveOrdersPage() {
  const router = useRouter();
  const items = useOrdersCatalogStore((s) => s.items);
  const filters = useOrdersCatalogStore((s) => s.filters);
  const page = useOrdersCatalogStore((s) => s.page);
  const pageSize = useOrdersCatalogStore((s) => s.pageSize);
  const setFilters = useOrdersCatalogStore((s) => s.setFilters);
  const setPage = useOrdersCatalogStore((s) => s.setPage);
  const isHydrated = useOrdersCatalogStore((s) => s.isHydrated);

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

  const filtered = useMemo(
    () => filterSortOrders(items, filters, ACTIVE_ORDER_STATUSES),
    [items, filters],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const rows = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const processingCount = items.filter(
    (i) => i.displayStatus === "processing" || i.displayStatus === "packed",
  ).length;
  const totalValue = filtered.reduce((sum, i) => sum + i.grandTotal, 0);

  return (
    <PageContainer>
      <PageHeader
        title="Active Orders"
        description="Orders generated after seller approval — track processing through delivery."
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: "Active" },
        ]}
      />

      <div className="space-y-4">
        <OrdersKpiCards
          items={[
            {
              label: "Total Active Orders",
              value: String(filtered.length),
              hint: "In pipeline",
              icon: Package,
            },
            {
              label: "Total Value",
              value: formatKpiValue(totalValue),
              hint: "Active book",
              icon: IndianRupee,
            },
            {
              label: "Orders Processing",
              value: String(processingCount),
              hint: "Packing / staging",
              icon: Clock3,
            },
          ]}
          append={<AvgDeliveryTimeCard />}
        />

        <OrdersFiltersBar
          filters={filters}
          onChange={setFilters}
          warehouses={warehouses}
          sellers={sellers}
          statusOptions={ACTIVE_ORDER_STATUSES}
        />

        {!isHydrated ? null : (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order / PO</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="min-w-[220px]">Stage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <p className="font-mono text-xs font-semibold">
                          {row.id}
                        </p>
                        <p className="font-mono text-[11px] text-slate-500">
                          {row.poNumber}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[160px] truncate text-sm font-medium">
                          {row.productName}
                        </p>
                        <p className="text-xs text-slate-500">{row.grade}</p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.sellerName}
                      </TableCell>
                      <TableCell className="text-sm">{row.warehouse}</TableCell>
                      <TableCell className="text-sm">
                        {formatQuantityMt(row.quantityMt)}
                      </TableCell>
                      <TableCell>
                        <OrderPaymentBadge
                          methodId={row.paymentMethodId}
                          title={row.paymentMethodTitle}
                        />
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        {formatInr(row.grandTotal, { compact: true })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateDdMmYyyy(row.expectedDelivery)}
                      </TableCell>
                      <TableCell>
                        <OrderStatusChip status={row.displayStatus} />
                      </TableCell>
                      <TableCell className="min-w-[220px] py-3">
                        <OrderProgressTrack
                          stages={ORDER_MVP_STAGES}
                          currentIndex={orderMvpStageIndex(row.displayStatus)}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button
                            size="sm"
                            className="h-8 rounded-lg bg-brand hover:bg-brand-700"
                            onClick={() =>
                              router.push(`${ROUTES.orderDetail}/${row.id}`)
                            }
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 rounded-lg"
                            onClick={() =>
                              toast.success("Invoice download queued (mock)")
                            }
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 rounded-lg"
                            onClick={() => router.push(ROUTES.support)}
                          >
                            <Headset className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <OrdersPagination
              page={pageSafe}
              totalPages={totalPages}
              total={filtered.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
