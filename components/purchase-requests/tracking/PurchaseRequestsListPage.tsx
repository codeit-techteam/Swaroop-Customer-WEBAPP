"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Ban,
  Copy,
  Eye,
  Package,
  Radio,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { orderPath } from "@/lib/order-journey-navigation";
import {
  ACTIVE_STATUSES,
  matchesPurchaseRequestCategory,
  PURCHASE_REQUEST_STATUS_CATEGORIES,
  purchaseRequestStatusCategoryLabel,
  type PurchaseRequestStatusCategory,
} from "@/mock/purchase-request/trackingRequests";
import { paymentMethodsMock } from "@/mock/purchase-request/paymentMethods";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import { usePurchaseRequestStore } from "@/store/purchaseRequestStore";
import { useOrdersStore } from "@/store/ordersStore";
import type { PurchaseRequestTrackingItem } from "@/types/purchase-request-tracking";
import { TrackingFiltersBar } from "./TrackingFiltersBar";
import { TrackingStatusBadge } from "./TrackingStatusBadge";
import { TrackingEmptyState } from "./TrackingEmptyState";

const PAGE_SIZE = 10;

const VALID_CATEGORIES = new Set<string>(PURCHASE_REQUEST_STATUS_CATEGORIES);

function parseStatusCategory(
  value: string | null,
): PurchaseRequestStatusCategory {
  if (value && VALID_CATEGORIES.has(value)) {
    return value as PurchaseRequestStatusCategory;
  }
  return "all";
}

function isActiveStatus(item: PurchaseRequestTrackingItem): boolean {
  return ACTIVE_STATUSES.includes(item.status);
}

function isWithdrawStatus(status: PurchaseRequestTrackingItem["status"]) {
  return (
    status === "pending_approval" ||
    status === "seller_reviewing" ||
    status === "review_pending"
  );
}

export function PurchaseRequestsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const items = usePurchaseRequestTrackingStore((s) => s.items);
  const cancelRequest = usePurchaseRequestTrackingStore((s) => s.cancelRequest);
  const isHydrated = usePurchaseRequestTrackingStore((s) => s.isHydrated);
  const liveRequest = usePurchaseRequestStore((s) => s.submittedRequest);
  const liveStatus = usePurchaseRequestStore((s) => s.requestStatus);
  const orders = useOrdersStore((s) => s.orders);

  const [search, setSearch] = useState("");
  const [statusCategory, setStatusCategory] =
    useState<PurchaseRequestStatusCategory>(() =>
      parseStatusCategory(searchParams.get("status")),
    );
  const [warehouse, setWarehouse] = useState("all");
  const [paymentType, setPaymentType] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setStatusCategory(parseStatusCategory(searchParams.get("status")));
  }, [searchParams]);

  useEffect(() => {
    const finish = () =>
      usePurchaseRequestTrackingStore.getState().setHydrated(true);
    const unsub =
      usePurchaseRequestTrackingStore.persist.onFinishHydration(finish);
    if (usePurchaseRequestTrackingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const statusFilterOptions = useMemo(
    () =>
      PURCHASE_REQUEST_STATUS_CATEGORIES.map((category) => ({
        value: category,
        label: purchaseRequestStatusCategoryLabel[category],
      })),
    [],
  );

  const warehouses = useMemo(
    () => [...new Set(items.map((i) => i.warehouse))].sort(),
    [items],
  );

  const filtered = useMemo(() => {
    return items
      .filter((item) =>
        matchesPurchaseRequestCategory(item.status, statusCategory),
      )
      .filter((item) =>
        warehouse === "all" ? true : item.warehouse === warehouse,
      )
      .filter((item) =>
        paymentType === "all" ? true : item.paymentMethodId === paymentType,
      )
      .filter((item) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          item.displayId.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.warehouse.toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [items, search, statusCategory, warehouse, paymentType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const rows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusCategory, warehouse, paymentType]);

  function handleStatusChange(value: string) {
    const category = parseStatusCategory(value);
    setStatusCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("status");
    } else {
      params.set("status", category);
    }
    const query = params.toString();
    router.replace(
      query ? `${ROUTES.purchaseRequests}?${query}` : ROUTES.purchaseRequests,
      {
        scroll: false,
      },
    );
  }

  const showLiveCta =
    Boolean(liveRequest) &&
    (liveStatus === "pending_approval" || liveStatus === "submitted");

  function renderActions(row: PurchaseRequestTrackingItem) {
    if (row.status === "approved") {
      return (
        <Button
          size="sm"
          className="h-8 rounded-lg bg-brand hover:bg-brand-700"
          onClick={() => {
            const live = orders.find(
              (o) =>
                o.id === row.orderId ||
                o.purchaseRequestDisplayId === row.displayId,
            );
            if (live) {
              router.push(orderPath(live.id));
              return;
            }
            if (row.orderId) {
              router.push(orderPath(row.orderId));
              return;
            }
            router.push(ROUTES.orders);
          }}
        >
          <Package className="h-3.5 w-3.5" />
          View Order
        </Button>
      );
    }

    if (row.status === "rejected") {
      return (
        <Button
          size="sm"
          className="h-8 rounded-lg bg-brand hover:bg-brand-700"
          onClick={() =>
            router.push(
              `${ROUTES.purchaseRequestsCreate}?productId=${row.productId}`,
            )
          }
        >
          <Copy className="h-3.5 w-3.5" />
          Duplicate
        </Button>
      );
    }

    if (row.status === "expired") {
      return (
        <Button
          size="sm"
          className="h-8 rounded-lg bg-brand hover:bg-brand-700"
          onClick={() =>
            router.push(
              `${ROUTES.purchaseRequestsCreate}?productId=${row.productId}`,
            )
          }
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Create New
        </Button>
      );
    }

    if (isActiveStatus(row)) {
      return (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg"
            onClick={() => {
              if (isWithdrawStatus(row.status)) {
                router.push(ROUTES.purchaseRequestsPendingLive);
                return;
              }
              toast.message(
                `${row.displayId} · ${formatInr(row.totalAmount, { compact: true })}`,
              );
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
          {row.canCancel && !isWithdrawStatus(row.status) ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                cancelRequest(row.id);
                toast.success("Request cancelled");
              }}
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel
            </Button>
          ) : null}
        </div>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        className="h-8 rounded-lg"
        onClick={() =>
          toast.message(
            `${row.displayId} · ${formatInr(row.totalAmount, { compact: true })}`,
          )
        }
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </Button>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Requests"
        description="Track active, pending, approved, rejected and expired purchase requests — filter by status, warehouse, supply source and payment type."
        breadcrumbs={[{ label: "Purchase Requests" }]}
      />

      {showLiveCta && liveRequest ? (
        <Card className="mb-4 border-accent-blue/30 bg-sky-50/60">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Live request in review — {liveRequest.displayId}
              </p>
              <p className="text-xs text-slate-600">
                Open the live validation timeline and 15-minute countdown.
              </p>
            </div>
            <Button
              className="h-10 rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => router.push(ROUTES.purchaseRequestsPendingLive)}
            >
              <Radio className="h-4 w-4" />
              Open Live Tracking
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        <TrackingFiltersBar
          search={search}
          onSearchChange={setSearch}
          status={statusCategory}
          onStatusChange={handleStatusChange}
          statusFilterOptions={statusFilterOptions}
          showExtended
          warehouse={warehouse}
          onWarehouseChange={setWarehouse}
          warehouses={warehouses}
          paymentType={paymentType}
          onPaymentTypeChange={setPaymentType}
          paymentTypes={paymentMethodsMock.map((m) => ({
            id: m.id,
            title: m.title,
          }))}
        />

        {!isHydrated ? null : rows.length === 0 ? (
          <TrackingEmptyState showMarketplaceCta={statusCategory === "all"} />
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Supply Source</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        {row.displayId}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateDdMmYyyy(row.createdAt)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{row.productName}</p>
                        <p className="text-xs text-slate-500">
                          {row.grade} · {formatQuantityMt(row.quantityMt)}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {"Verified Supply Partner"}
                      </TableCell>
                      <TableCell className="text-sm">{row.warehouse}</TableCell>
                      <TableCell className="text-sm">
                        {row.paymentMethodTitle}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        {formatInr(row.totalAmount, { compact: true })}
                      </TableCell>
                      <TableCell>
                        <TrackingStatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {renderActions(row)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Showing {(pageSafe - 1) * PAGE_SIZE + 1}–
                {Math.min(pageSafe * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  disabled={pageSafe <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs font-medium text-slate-600">
                  {pageSafe} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  disabled={pageSafe >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
