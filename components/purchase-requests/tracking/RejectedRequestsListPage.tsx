"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatDateDdMmYyyy, formatQuantityMt } from "@/lib/format";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import type { PurchaseRequestTrackingItem } from "@/types/purchase-request-tracking";
import { TrackingEmptyState } from "./TrackingEmptyState";
import { TrackingStatusBadge } from "./TrackingStatusBadge";

export function RejectedRequestsListPage() {
  const router = useRouter();
  const items = usePurchaseRequestTrackingStore((s) => s.items);
  const isHydrated = usePurchaseRequestTrackingStore((s) => s.isHydrated);
  const [reasonItem, setReasonItem] =
    useState<PurchaseRequestTrackingItem | null>(null);

  useEffect(() => {
    const finish = () =>
      usePurchaseRequestTrackingStore.getState().setHydrated(true);
    const unsub =
      usePurchaseRequestTrackingStore.persist.onFinishHydration(finish);
    if (usePurchaseRequestTrackingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const rows = useMemo(
    () => items.filter((item) => item.status === "rejected"),
    [items],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Rejected Requests"
        description="Requests declined by the seller with reason and suggested next steps."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "Rejected" },
        ]}
      />

      {!isHydrated ? null : rows.length === 0 ? (
        <TrackingEmptyState
          title="No rejected requests"
          description="Rejected purchase requests will be listed here with seller reasons."
          showMarketplaceCta={false}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rejected By</TableHead>
                <TableHead>Reason</TableHead>
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
                    {row.rejectedAt
                      ? formatDateDdMmYyyy(row.rejectedAt)
                      : formatDateDdMmYyyy(row.createdAt)}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{row.productName}</p>
                    <p className="text-xs text-slate-500">
                      {formatQuantityMt(row.quantityMt)}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.rejectedBy ?? "Seller Desk"}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate text-sm text-slate-600">
                    {row.rejectionReason ?? "—"}
                  </TableCell>
                  <TableCell>
                    <TrackingStatusBadge status="rejected" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg"
                        onClick={() => setReasonItem(row)}
                      >
                        <Info className="h-3.5 w-3.5" />
                        Reason
                      </Button>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={Boolean(reasonItem)}
        onOpenChange={(open) => {
          if (!open) setReasonItem(null);
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Rejection — {reasonItem?.displayId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-slate-500">Rejected by</p>
            <p className="font-medium">
              {reasonItem?.rejectedBy ?? "Seller Desk"}
            </p>
            <p className="text-slate-500">Reason</p>
            <p className="rounded-xl bg-red-50 p-3 text-red-900">
              {reasonItem?.rejectionReason ?? "No reason provided."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
