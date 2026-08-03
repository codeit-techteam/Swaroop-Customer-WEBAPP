"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IndianRupee, MapPinned, Navigation } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { paymentsDetailPath } from "@/constants/payments";
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import {
  filterSortPayments,
  usePaymentsCatalogStore,
} from "@/store/paymentsCatalogStore";
import { PaymentFiltersBar } from "./PaymentFiltersBar";
import { PaymentStatusChip } from "./PaymentStatusChip";

export function OnDeliveryPaymentPage() {
  const router = useRouter();
  const payments = usePaymentsCatalogStore((s) => s.payments);
  const filters = usePaymentsCatalogStore((s) => s.filters);
  const setFilters = usePaymentsCatalogStore((s) => s.setFilters);
  const resetFilters = usePaymentsCatalogStore((s) => s.resetFilters);
  const payOnDelivery = usePaymentsCatalogStore((s) => s.payOnDelivery);
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
    () => filterSortPayments(payments, filters, "on_delivery"),
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
        title="On Delivery Payment"
        description="Payment becomes active when the shipment reaches destination."
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "On Delivery Payment" },
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

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((p) => {
          const canPay = [
            "pending",
            "pending_payment",
            "overdue",
            "processing",
          ].includes(p.status);
          return (
            <Card
              key={p.id}
              className="border-slate-200 shadow-card hover:border-brand/30"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{p.orderNumber}</CardTitle>
                  <p className="text-xs text-slate-500">
                    {p.product} · {formatQuantityMt(p.quantityMt)}
                  </p>
                </div>
                <PaymentStatusChip status={p.status} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Meta
                    label="Shipment Status"
                    value={p.shipmentStatus ?? "—"}
                  />
                  <Meta label="Driver" value={p.driverName ?? "—"} />
                  <Meta label="Vehicle" value={p.vehicleNumber ?? "—"} />
                  <Meta
                    label="ETA"
                    value={
                      p.dispatchEta ? formatDateDdMmYyyy(p.dispatchEta) : "—"
                    }
                  />
                  <Meta
                    label="Delivery Date"
                    value={
                      p.deliveryDate ? formatDateDdMmYyyy(p.deliveryDate) : "—"
                    }
                  />
                  <Meta
                    label="Payment Due"
                    value={formatDateDdMmYyyy(p.dueDate)}
                  />
                </div>
                <p className="text-xl font-semibold text-brand">
                  {formatInr(p.totalAmount)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => router.push(ROUTES.shipmentTracking)}
                  >
                    <Navigation className="h-4 w-4" />
                    Track Shipment
                  </Button>
                  {canPay ? (
                    <Button
                      className="rounded-xl bg-brand hover:bg-brand-700"
                      onClick={() => {
                        payOnDelivery(p.id);
                        toast.success("Delivery payment completed");
                      }}
                    >
                      <IndianRupee className="h-4 w-4" />
                      Pay Now
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => router.push(paymentsDetailPath(p.id))}
                  >
                    <MapPinned className="h-4 w-4" />
                    Details
                  </Button>
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
