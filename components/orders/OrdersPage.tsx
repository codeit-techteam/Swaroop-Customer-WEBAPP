"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Clock3,
  Download,
  Eye,
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
import {
  ACTIVE_ORDER_STATUSES,
  ALL_ORDER_STATUSES,
  ordersDisplayStatusLabel,
} from "@/mock/orders-catalog";
import {
  filterSortOrders,
  useOrdersCatalogStore,
  type OrdersCatalogFilters,
} from "@/store/ordersCatalogStore";
import type {
  OrdersDisplayStatus,
  OrdersKpiFocus,
} from "@/types/orders-catalog";
import { OrdersActiveFilterHeader } from "./OrdersActiveFilterHeader";
import { OrderPaymentBadge } from "./OrderPaymentBadge";
import { OrderStatusChip } from "./OrderStatusChip";
import { OrdersFiltersBar } from "./OrdersFiltersBar";
import { formatKpiValue, OrdersKpiCards } from "./OrdersKpiCards";
import { OrdersPagination } from "./OrdersPagination";
import { OrdersRequiringAttentionCard } from "./OrdersRequiringAttentionCard";

const VALID_STATUSES = new Set<string>(ALL_ORDER_STATUSES);

function parseStatus(value: string | null): OrdersCatalogFilters["status"] {
  if (value && VALID_STATUSES.has(value)) {
    return value as OrdersDisplayStatus;
  }
  return "all";
}

function tableTitle(
  kpiFocus: OrdersKpiFocus,
  status: OrdersCatalogFilters["status"],
): string {
  if (kpiFocus === "all") {
    return "In Pipeline";
  }
  if (kpiFocus !== "none") {
    return kpiFocusTitle(kpiFocus);
  }
  if (status !== "all") {
    return `${ordersDisplayStatusLabel(status)} Orders`;
  }
  return "Orders";
}

export function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    setFilters({ status: parseStatus(searchParams.get("status")) });
  }, [searchParams, setFilters]);

  useEffect(() => {
    const finish = () => useOrdersCatalogStore.getState().setHydrated(true);
    const unsub = useOrdersCatalogStore.persist.onFinishHydration(finish);
    if (useOrdersCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const sellers = useMemo(() => [] as string[], []);

  const pipelineOrders = useMemo(
    () => items.filter((i) => ACTIVE_ORDER_STATUSES.includes(i.displayStatus)),
    [items],
  );

  const processingOrders = useMemo(
    () => pipelineOrders.filter(isProcessing),
    [pipelineOrders],
  );
  const attentionOrders = useMemo(
    () => pipelineOrders.filter(requiresAttention),
    [pipelineOrders],
  );
  const paymentPendingOrders = useMemo(
    () => pipelineOrders.filter(isPaymentPending),
    [pipelineOrders],
  );
  const delayedOrders = useMemo(
    () => pipelineOrders.filter(isDelayed),
    [pipelineOrders],
  );
  const readyDispatchOrders = useMemo(
    () => pipelineOrders.filter(isReadyForDispatch),
    [pipelineOrders],
  );

  const pipelineCount = pipelineOrders.length;
  const pipelineValue = pipelineOrders.reduce(
    (sum, i) => sum + i.grandTotal,
    0,
  );
  const processingCount = processingOrders.length;
  const attentionCount = attentionOrders.length;

  const filtered = useMemo(() => {
    let scoped = filterSortOrders(items, filters);
    if (kpiFocus === "all") {
      scoped = scoped.filter((i) =>
        ACTIVE_ORDER_STATUSES.includes(i.displayStatus),
      );
    }
    return applyKpiFocus(scoped, kpiFocus);
  }, [items, filters, kpiFocus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const rows = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const hasDropdownFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.seller !== "all" ||
    filters.paymentType !== "all" ||
    filters.deliveryType !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.sortBy !== "newest";

  const hasKpiFilter = kpiFocus !== "none" && kpiFocus !== "all";

  const handleFilterChange = (patch: Partial<OrdersCatalogFilters>) => {
    setFilters(patch);
    setPage(1);

    if ("status" in patch) {
      const status = patch.status ?? "all";
      const params = new URLSearchParams(searchParams.toString());
      if (status === "all") {
        params.delete("status");
      } else {
        params.set("status", status);
      }
      const query = params.toString();
      router.replace(query ? `${ROUTES.orders}?${query}` : ROUTES.orders, {
        scroll: false,
      });
    }
  };

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
    router.replace(ROUTES.orders, { scroll: false });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Orders"
        description="Orders generated after PetroTrade confirmation — track processing through delivery."
        breadcrumbs={[{ label: "Orders" }]}
      />

      <div className="space-y-4">
        <OrdersKpiCards
          items={[
            {
              id: "pipeline",
              label: "In Pipeline",
              value: String(pipelineCount),
              hint: "Active book",
              icon: Package,
              active: kpiFocus === "all",
              onClick: () => selectKpi("all"),
            },
            {
              id: "total-value",
              label: "Pipeline Value",
              value: formatKpiValue(pipelineValue),
              hint: "In pipeline",
              icon: IndianRupee,
              active: kpiFocus === "value",
              onClick: () => selectKpi("value"),
            },
            {
              id: "processing",
              label: "Processing",
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
          onChange={handleFilterChange}
          sellers={sellers}
          statusOptions={ALL_ORDER_STATUSES}
        />

        {!isHydrated ? null : (
          <>
            <OrdersActiveFilterHeader
              title={tableTitle(kpiFocus, filters.status)}
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
                    <TableHead>Qty</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
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
                            {"Verified Supply Partner"}
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
