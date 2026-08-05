"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
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
import {
  applyKpiFocus,
  getAttentionReasons,
  isDelayed,
  isPaymentPending,
  isProcessing,
  isReadyForDispatch,
  kpiFocusChipLabel,
  kpiFocusTitle,
  requiresAttention,
} from "@/lib/order-attention";
import { ACTIVE_ORDER_STATUSES } from "@/mock/orders-catalog";
import {
  filterSortOrders,
  useOrdersCatalogStore,
} from "@/store/ordersCatalogStore";
import type { OrdersKpiFocus } from "@/types/orders-catalog";
import { OrdersActiveFilterHeader } from "./OrdersActiveFilterHeader";
import { OrderPaymentBadge } from "./OrderPaymentBadge";
import { OrderProgressTrack } from "./OrderProgressTrack";
import { OrderStatusChip } from "./OrderStatusChip";
import { OrdersFiltersBar } from "./OrdersFiltersBar";
import { formatKpiValue, OrdersKpiCards } from "./OrdersKpiCards";
import { OrdersPagination } from "./OrdersPagination";
import { OrdersRequiringAttentionCard } from "./OrdersRequiringAttentionCard";

export function ActiveOrdersPage() {
  const router = useRouter();
  const items = useOrdersCatalogStore((s) => s.items);
  const filters = useOrdersCatalogStore((s) => s.filters);
  const page = useOrdersCatalogStore((s) => s.page);
  const pageSize = useOrdersCatalogStore((s) => s.pageSize);
  const setFilters = useOrdersCatalogStore((s) => s.setFilters);
  const resetFilters = useOrdersCatalogStore((s) => s.resetFilters);
  const setPage = useOrdersCatalogStore((s) => s.setPage);
  const isHydrated = useOrdersCatalogStore((s) => s.isHydrated);

  const [kpiFocus, setKpiFocus] = useState<OrdersKpiFocus>("none");

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

  /** Base active pipeline — shared source for KPIs and table. */
  const activeOrders = useMemo(
    () => items.filter((i) => ACTIVE_ORDER_STATUSES.includes(i.displayStatus)),
    [items],
  );

  const processingOrders = useMemo(
    () => activeOrders.filter(isProcessing),
    [activeOrders],
  );
  const attentionOrders = useMemo(
    () => activeOrders.filter(requiresAttention),
    [activeOrders],
  );
  const paymentPendingOrders = useMemo(
    () => activeOrders.filter(isPaymentPending),
    [activeOrders],
  );
  const delayedOrders = useMemo(
    () => activeOrders.filter(isDelayed),
    [activeOrders],
  );
  const readyDispatchOrders = useMemo(
    () => activeOrders.filter(isReadyForDispatch),
    [activeOrders],
  );

  const totalActive = activeOrders.length;
  const totalValue = activeOrders.reduce((sum, i) => sum + i.grandTotal, 0);
  const processingCount = processingOrders.length;
  const attentionCount = attentionOrders.length;

  const filtered = useMemo(() => {
    const scoped = filterSortOrders(items, filters, ACTIVE_ORDER_STATUSES);
    return applyKpiFocus(scoped, kpiFocus);
  }, [items, filters, kpiFocus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const rows = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const hasDropdownFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.warehouse !== "all" ||
    filters.seller !== "all" ||
    filters.paymentType !== "all" ||
    filters.deliveryType !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.sortBy !== "newest";

  const hasKpiFilter = kpiFocus !== "none" && kpiFocus !== "all";

  const selectKpi = (focus: OrdersKpiFocus) => {
    setKpiFocus(focus);
    setPage(1);
    if (focus === "value") {
      setFilters({ sortBy: "amount_desc" });
    } else if (kpiFocus === "value" && filters.sortBy === "amount_desc") {
      setFilters({ sortBy: "newest" });
    }
  };

  const clearKpiFilter = () => {
    if (kpiFocus === "value" && filters.sortBy === "amount_desc") {
      setFilters({ sortBy: "newest" });
    }
    setKpiFocus("none");
    setPage(1);
  };

  const clearAll = () => {
    resetFilters();
    setKpiFocus("none");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Active Orders"
        description="Orders generated after PetroTrade confirmation — track processing through delivery."
        breadcrumbs={[
          { label: "Orders", href: ROUTES.orders },
          { label: "Active" },
        ]}
      />

      <div className="space-y-4">
        <OrdersKpiCards
          items={[
            {
              id: "total-active",
              label: "Total Active Orders",
              value: String(totalActive),
              hint: "In pipeline",
              icon: Package,
              active: kpiFocus === "all",
              onClick: () => selectKpi("all"),
            },
            {
              id: "total-value",
              label: "Total Value",
              value: formatKpiValue(totalValue),
              hint: "Active book",
              icon: IndianRupee,
              active: kpiFocus === "value",
              onClick: () => selectKpi("value"),
            },
            {
              id: "processing",
              label: "Orders Processing",
              value: String(processingCount),
              hint: "Packing / staging",
              icon: Clock3,
              active: kpiFocus === "processing",
              onClick: () => selectKpi("processing"),
            },
          ]}
          append={
            <OrdersRequiringAttentionCard
              count={attentionCount}
              breakdown={{
                paymentPending: paymentPendingOrders.length,
                delayed: delayedOrders.length,
                readyForDispatch: readyDispatchOrders.length,
              }}
              active={
                kpiFocus === "attention" ||
                kpiFocus === "payment_pending" ||
                kpiFocus === "delayed" ||
                kpiFocus === "ready_for_dispatch"
              }
              onSelectAll={() => selectKpi("attention")}
              onSelectPaymentPending={() => selectKpi("payment_pending")}
              onSelectDelayed={() => selectKpi("delayed")}
              onSelectReadyForDispatch={() => selectKpi("ready_for_dispatch")}
            />
          }
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
            <OrdersActiveFilterHeader
              title={kpiFocusTitle(kpiFocus)}
              count={filtered.length}
              chipLabel={kpiFocusChipLabel(kpiFocus)}
              onClearKpiFilter={hasKpiFilter ? clearKpiFilter : undefined}
              hasDropdownFilters={hasDropdownFilters}
              onClearAll={hasDropdownFilters ? clearAll : undefined}
            />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order / PO</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Supply Source</TableHead>
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
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="py-12 text-center text-sm text-slate-500"
                      >
                        No orders match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => {
                      const reasons = getAttentionReasons(row);
                      return (
                        <TableRow key={row.id}>
                          <TableCell>
                            <p className="font-mono text-xs font-semibold">
                              {row.id}
                            </p>
                            <p className="font-mono text-[11px] text-slate-500">
                              {row.poNumber}
                            </p>
                            {reasons.length > 0 ? (
                              <div className="mt-1.5 space-y-0.5">
                                {reasons.map((reason) => (
                                  <p
                                    key={reason}
                                    className="flex items-center gap-1 text-[11px] font-medium text-amber-700"
                                  >
                                    <AlertTriangle className="h-3 w-3 shrink-0" />
                                    {reason}
                                  </p>
                                ))}
                              </div>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <p className="max-w-[160px] truncate text-sm font-medium">
                              {row.productName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {row.grade}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">
                            {row.sellerName}
                          </TableCell>
                          <TableCell className="text-sm">
                            {row.warehouse}
                          </TableCell>
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
                              currentIndex={orderMvpStageIndex(
                                row.displayStatus,
                              )}
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
                                  toast.success(
                                    "Invoice download queued (mock)",
                                  )
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
                      );
                    })
                  )}
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
