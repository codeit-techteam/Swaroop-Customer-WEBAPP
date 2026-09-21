"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Eye, RotateCcw } from "lucide-react";
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
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import { TrackingEmptyState } from "./TrackingEmptyState";
import { TrackingStatusBadge } from "./TrackingStatusBadge";
import { PrListSkeleton } from "@/components/purchase-requests/pr-list-skeleton";

export function ExpiredRequestsListPage() {
  const router = useRouter();
  const items = usePurchaseRequestTrackingStore((s) => s.items);
  const isHydrated = usePurchaseRequestTrackingStore((s) => s.isHydrated);

  useEffect(() => {
    const finish = () =>
      usePurchaseRequestTrackingStore.getState().setHydrated(true);
    const unsub =
      usePurchaseRequestTrackingStore.persist.onFinishHydration(finish);
    if (usePurchaseRequestTrackingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const rows = useMemo(
    () => items.filter((item) => item.status === "expired"),
    [items],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Expired Requests"
        description="Requests that exceeded the 15-minute PetroTrade confirmation window."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "Expired" },
        ]}
      />

      {!isHydrated ? (
        <PrListSkeleton />
      ) : rows.length === 0 ? (
        <TrackingEmptyState
          title="No expired requests"
          description="Timed-out approval windows will appear here."
          showMarketplaceCta={false}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Supply Source</TableHead>
                <TableHead>Time Expired</TableHead>
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
                  <TableCell>
                    <p className="text-sm font-medium">{row.productName}</p>
                    <p className="text-xs text-slate-500">
                      {formatQuantityMt(row.quantityMt)} · {row.warehouse}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {"Verified Supply Partner"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.expiredAt
                      ? formatDateDdMmYyyy(row.expiredAt)
                      : row.expectedExpiryAt
                        ? formatDateDdMmYyyy(row.expectedExpiryAt)
                        : "—"}
                  </TableCell>
                  <TableCell className="text-sm font-semibold">
                    {formatInr(row.totalAmount, { compact: true })}
                  </TableCell>
                  <TableCell>
                    <TrackingStatusBadge status="expired" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg"
                        onClick={() =>
                          toast.message(
                            `${row.displayId} expired after 15-minute window`,
                          )
                        }
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
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
                        <RotateCcw className="h-3.5 w-3.5" />
                        Create New
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageContainer>
  );
}
