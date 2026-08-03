"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Ban } from "lucide-react";
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
  ACTIVE_STATUSES,
  formatCountdown,
} from "@/mock/purchase-request/trackingRequests";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import type { TrackingListStatus } from "@/types/purchase-request-tracking";
import { TrackingFiltersBar } from "./TrackingFiltersBar";
import { TrackingStatusBadge } from "./TrackingStatusBadge";
import { TrackingEmptyState } from "./TrackingEmptyState";

export function ActiveRequestsPage() {
  const router = useRouter();
  const items = usePurchaseRequestTrackingStore((s) => s.items);
  const cancelRequest = usePurchaseRequestTrackingStore((s) => s.cancelRequest);
  const isHydrated = usePurchaseRequestTrackingStore((s) => s.isHydrated);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const finish = () =>
      usePurchaseRequestTrackingStore.getState().setHydrated(true);
    const unsub =
      usePurchaseRequestTrackingStore.persist.onFinishHydration(finish);
    if (usePurchaseRequestTrackingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const rows = useMemo(() => {
    return items
      .filter((item) => ACTIVE_STATUSES.includes(item.status))
      .filter((item) => (status === "all" ? true : item.status === status))
      .filter((item) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          item.displayId.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.sellerName.toLowerCase().includes(q) ||
          item.warehouse.toLowerCase().includes(q)
        );
      });
  }, [items, search, status]);

  return (
    <PageContainer>
      <PageHeader
        title="Active Requests"
        description="Purchase requests currently in progress — draft through seller review."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "Active" },
        ]}
      />

      <div className="space-y-4">
        <TrackingFiltersBar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          statusOptions={ACTIVE_STATUSES as TrackingListStatus[]}
        />

        {!isHydrated ? null : rows.length === 0 ? (
          <TrackingEmptyState />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {row.displayId}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[180px]">
                        <p className="truncate text-sm font-medium">
                          {row.productName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {row.grade} · {formatQuantityMt(row.quantityMt)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{row.sellerName}</TableCell>
                    <TableCell className="text-sm">{row.warehouse}</TableCell>
                    <TableCell className="text-sm">
                      {formatDateDdMmYyyy(row.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.paymentMethodTitle}
                    </TableCell>
                    <TableCell>
                      <TrackingStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {row.secondsRemaining != null
                        ? formatCountdown(row.secondsRemaining)
                        : row.expectedExpiryAt
                          ? formatDateDdMmYyyy(row.expectedExpiryAt)
                          : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg"
                          onClick={() => {
                            if (
                              row.status === "pending_approval" ||
                              row.status === "seller_reviewing" ||
                              row.status === "review_pending"
                            ) {
                              router.push(ROUTES.purchaseRequestsPending);
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
                        {row.canCancel ? (
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
