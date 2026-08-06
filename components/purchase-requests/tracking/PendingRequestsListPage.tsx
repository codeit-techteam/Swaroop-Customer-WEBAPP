"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Ban, Radio } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants";
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import {
  formatCountdown,
  PENDING_STATUSES,
} from "@/mock/purchase-request/trackingRequests";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import { usePurchaseRequestStore } from "@/store/purchaseRequestStore";
import { TrackingEmptyState } from "./TrackingEmptyState";
import { TrackingStatusBadge } from "./TrackingStatusBadge";

export function PendingRequestsListPage() {
  const router = useRouter();
  const items = usePurchaseRequestTrackingStore((s) => s.items);
  const withdrawRequest = usePurchaseRequestTrackingStore(
    (s) => s.withdrawRequest,
  );
  const refreshPendingTimers = usePurchaseRequestTrackingStore(
    (s) => s.refreshPendingTimers,
  );
  const isHydrated = usePurchaseRequestTrackingStore((s) => s.isHydrated);
  const liveRequest = usePurchaseRequestStore((s) => s.submittedRequest);
  const liveStatus = usePurchaseRequestStore((s) => s.requestStatus);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const finish = () =>
      usePurchaseRequestTrackingStore.getState().setHydrated(true);
    const unsub =
      usePurchaseRequestTrackingStore.persist.onFinishHydration(finish);
    if (usePurchaseRequestTrackingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      refreshPendingTimers();
      setTick((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [refreshPendingTimers]);

  const rows = useMemo(() => {
    void tick;
    return items.filter((item) => PENDING_STATUSES.includes(item.status));
  }, [items, tick]);

  const showLiveCta =
    Boolean(liveRequest) &&
    (liveStatus === "pending_approval" || liveStatus === "submitted");

  return (
    <PageContainer>
      <PageHeader
        title="Pending Confirmation"
        description="Requests inside the 15-minute PetroTrade confirmation window."
        breadcrumbs={[
          { label: "Purchase Requests", href: ROUTES.purchaseRequests },
          { label: "Pending Approval" },
        ]}
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

      {!isHydrated ? null : rows.length === 0 ? (
        <TrackingEmptyState
          title="No pending approvals"
          description="Submitted requests awaiting PetroTrade review will appear here with a live countdown."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row) => {
            const remaining = row.secondsRemaining ?? 0;
            const progress = Math.min(
              100,
              Math.round(((15 * 60 - remaining) / (15 * 60)) * 100),
            );
            return (
              <Card key={row.id} className="border-slate-200 shadow-card">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold">
                        {row.displayId}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {row.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.grade} · {formatQuantityMt(row.quantityMt)} ·{" "}
                        {"Verified Supply Partner"}
                      </p>
                    </div>
                    <TrackingStatusBadge status={row.status} />
                  </div>

                  <div className="rounded-xl bg-amber-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-amber-800">
                        Time remaining
                      </p>
                      <p className="font-mono text-lg font-semibold text-amber-950">
                        {formatCountdown(remaining)}
                      </p>
                    </div>
                    <Progress value={progress} className="mt-2 h-2" />
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-[11px] uppercase text-slate-500">
                        Submitted
                      </dt>
                      <dd className="font-medium">
                        {row.submittedAt
                          ? formatDateDdMmYyyy(row.submittedAt)
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase text-slate-500">
                        Amount
                      </dt>
                      <dd className="font-medium">
                        {formatInr(row.totalAmount, { compact: true })}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-[11px] uppercase text-slate-500">
                        Warehouse
                      </dt>
                      <dd className="font-medium">{row.warehouse}</dd>
                    </div>
                  </dl>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      className="h-10 flex-1 rounded-xl bg-brand hover:bg-brand-700"
                      onClick={() => toast.message("Status refreshed")}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh Status
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 flex-1 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => {
                        withdrawRequest(row.id);
                        toast.success("Request withdrawn");
                      }}
                    >
                      <Ban className="h-4 w-4" />
                      Withdraw Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
