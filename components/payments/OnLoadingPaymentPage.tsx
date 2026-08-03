"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IndianRupee, Truck } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants";
import { paymentsDetailPath } from "@/constants/payments";
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import {
  filterSortPayments,
  usePaymentsCatalogStore,
} from "@/store/paymentsCatalogStore";
import { PaymentFiltersBar } from "./PaymentFiltersBar";
import { PaymentStatusChip } from "./PaymentStatusChip";
import { PaymentTimeline } from "./PaymentTimeline";

export function OnLoadingPaymentPage() {
  const router = useRouter();
  const payments = usePaymentsCatalogStore((s) => s.payments);
  const filters = usePaymentsCatalogStore((s) => s.filters);
  const setFilters = usePaymentsCatalogStore((s) => s.setFilters);
  const resetFilters = usePaymentsCatalogStore((s) => s.resetFilters);
  const payOnLoading = usePaymentsCatalogStore((s) => s.payOnLoading);
  const isHydrated = usePaymentsCatalogStore((s) => s.isHydrated);

  useEffect(() => {
    const finish = () => usePaymentsCatalogStore.getState().setHydrated(true);
    const unsub = usePaymentsCatalogStore.persist.onFinishHydration(finish);
    if (usePaymentsCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const warehouses = useMemo(
    () => [...new Set(payments.map((p) => p.warehouse))].sort(),
    [payments],
  );
  const sellers = useMemo(
    () => [...new Set(payments.map((p) => p.seller))].sort(),
    [payments],
  );
  const list = useMemo(
    () => filterSortPayments(payments, filters, "on_loading"),
    [payments, filters],
  );

  if (!isHydrated) {
    return (
      <PageContainer>
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="On Loading Payment"
        description="Payments that become active after warehouse loading begins."
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "On Loading Payment" },
        ]}
      />

      <PaymentFiltersBar
        filters={filters}
        warehouses={warehouses}
        sellers={sellers}
        onChange={setFilters}
        onReset={resetFilters}
        hideType
      />

      <div className="grid gap-4">
        {list.map((p) => {
          const canPay = [
            "pending",
            "pending_payment",
            "overdue",
            "failed",
          ].includes(p.status);
          return (
            <Card
              key={p.id}
              className="border-slate-200 shadow-card transition hover:border-brand/30"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">
                    {p.orderNumber} · {p.product}
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    {p.poNumber} · {p.warehouse} ·{" "}
                    {formatQuantityMt(p.quantityMt)}
                  </p>
                </div>
                <PaymentStatusChip status={p.status} />
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-5">
                <div className="space-y-3 lg:col-span-2">
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>Loading progress</span>
                      <span>{p.loadingPercent ?? 0}%</span>
                    </div>
                    <Progress value={p.loadingPercent ?? 0} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Meta label="Warehouse" value={p.warehouse} />
                    <Meta label="Vehicle" value={p.vehicleNumber ?? "—"} />
                    <Meta label="Driver" value={p.driverName ?? "—"} />
                    <Meta
                      label="Dispatch ETA"
                      value={
                        p.dispatchEta ? formatDateDdMmYyyy(p.dispatchEta) : "—"
                      }
                    />
                  </div>
                  <p className="text-lg font-semibold text-brand">
                    {formatInr(p.totalAmount)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {canPay ? (
                      <Button
                        className="rounded-xl bg-brand hover:bg-brand-700"
                        onClick={() => {
                          payOnLoading(p.id);
                          toast.success("Loading payment completed");
                        }}
                      >
                        <IndianRupee className="h-4 w-4" />
                        Pay Now
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => router.push(paymentsDetailPath(p.id))}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 lg:col-span-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Truck className="h-4 w-4 text-brand" />
                    Loading Timeline
                  </div>
                  <PaymentTimeline steps={p.timeline} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase text-slate-400">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  );
}
