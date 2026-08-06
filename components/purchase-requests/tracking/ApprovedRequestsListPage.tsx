"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Download, Package } from "lucide-react";
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
import { orderPath } from "@/lib/order-journey-navigation";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import { useOrdersStore } from "@/store/ordersStore";
import { TrackingEmptyState } from "./TrackingEmptyState";
import { TrackingStatusBadge } from "./TrackingStatusBadge";

export function ApprovedRequestsListPage() {
  const router = useRouter();
  const items = usePurchaseRequestTrackingStore((s) => s.items);
  const isHydrated = usePurchaseRequestTrackingStore((s) => s.isHydrated);
  const orders = useOrdersStore((s) => s.orders);

  useEffect(() => {
    const finish = () =>
      usePurchaseRequestTrackingStore.getState().setHydrated(true);
    const unsub =
      usePurchaseRequestTrackingStore.persist.onFinishHydration(finish);
    if (usePurchaseRequestTrackingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const rows = useMemo(
    () => items.filter((item) => item.status === "approved"),
    [items],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Approved Requests"
        description="Confirmed purchase requests with generated order and PO numbers."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "Approved" },
        ]}
      />

      {!isHydrated ? null : rows.length === 0 ? (
        <TrackingEmptyState
          title="No approved requests"
          description="Approved requests appear here after PetroTrade confirms within the 15-minute window."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Order / PO</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Supply Source</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Order Status</TableHead>
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
                    <p className="font-mono text-xs font-semibold">
                      {row.orderId ?? "—"}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500">
                      {row.poNumber ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{row.productName}</p>
                    <p className="text-xs text-slate-500">
                      {formatQuantityMt(row.quantityMt)}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.approvedAt ? formatDateDdMmYyyy(row.approvedAt) : "—"}
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
                    <TrackingStatusBadge status="approved" />
                    <p className="mt-1 text-[11px] text-slate-500">
                      {row.orderStatus ?? "Order Created"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg"
                        onClick={() =>
                          toast.success("Summary download queued (mock)")
                        }
                      >
                        <Download className="h-3.5 w-3.5" />
                        Summary
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
