"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { HISTORY_STATUSES } from "@/mock/purchase-request/trackingRequests";
import { paymentMethodsMock } from "@/mock/purchase-request/paymentMethods";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import type { TrackingListStatus } from "@/types/purchase-request-tracking";
import { TrackingFiltersBar } from "./TrackingFiltersBar";
import { TrackingStatusBadge } from "./TrackingStatusBadge";
import { TrackingEmptyState } from "./TrackingEmptyState";

const PAGE_SIZE = 8;

export function RequestHistoryPage() {
  const items = usePurchaseRequestTrackingStore((s) => s.items);
  const isHydrated = usePurchaseRequestTrackingStore((s) => s.isHydrated);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [seller, setSeller] = useState("all");
  const [paymentType, setPaymentType] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const finish = () =>
      usePurchaseRequestTrackingStore.getState().setHydrated(true);
    const unsub =
      usePurchaseRequestTrackingStore.persist.onFinishHydration(finish);
    if (usePurchaseRequestTrackingStore.persist.hasHydrated()) finish();
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

  const filtered = useMemo(() => {
    return items
      .filter(
        (item) =>
          HISTORY_STATUSES.includes(item.status) || item.status === "approved",
      )
      .filter((item) => (status === "all" ? true : item.status === status))
      .filter((item) =>
        warehouse === "all" ? true : item.warehouse === warehouse,
      )
      .filter((item) => (seller === "all" ? true : item.sellerName === seller))
      .filter((item) =>
        paymentType === "all" ? true : item.paymentMethodId === paymentType,
      )
      .filter((item) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          item.displayId.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.sellerName.toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [items, search, status, warehouse, seller, paymentType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const rows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, status, warehouse, seller, paymentType]);

  return (
    <PageContainer>
      <PageHeader
        title="Request History"
        description="Complete purchase request history across completed, rejected, expired, approved, cancelled and archived."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "History" },
        ]}
      />

      <div className="space-y-4">
        <TrackingFiltersBar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          statusOptions={HISTORY_STATUSES as TrackingListStatus[]}
          showExtended
          warehouse={warehouse}
          onWarehouseChange={setWarehouse}
          warehouses={warehouses}
          seller={seller}
          onSellerChange={setSeller}
          sellers={sellers}
          paymentType={paymentType}
          onPaymentTypeChange={setPaymentType}
          paymentTypes={paymentMethodsMock.map((m) => ({
            id: m.id,
            title: m.title,
          }))}
        />

        {!isHydrated ? null : rows.length === 0 ? (
          <TrackingEmptyState showMarketplaceCta={false} />
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
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
                          {formatQuantityMt(row.quantityMt)}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.sellerName}
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
                  <ChevronLeft className="h-4 w-4" />
                  Prev
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
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
