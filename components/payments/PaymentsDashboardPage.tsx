"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bell, Eye } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { paymentsDetailPath } from "@/constants/payments";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import {
  computeCredit15Summary,
  computeCredit30Summary,
} from "@/mock/payments-catalog";
import {
  filterSortPayments,
  usePaymentsCatalogStore,
} from "@/store/paymentsCatalogStore";
import type { PaymentsDashboardSummary } from "@/types/payments";
import { PaymentStatusChip } from "./PaymentStatusChip";
import {
  PaymentQuickActions,
  PaymentSummaryCards,
} from "./PaymentSummaryCards";

function buildSummary(
  payments: ReturnType<typeof usePaymentsCatalogStore.getState>["payments"],
): PaymentsDashboardSummary {
  const open = payments.filter(
    (p) => !["paid", "verified", "cancelled", "refunded"].includes(p.status),
  );
  const monthStart = new Date("2026-08-01T00:00:00+05:30").getTime();
  const paidThisMonth = payments
    .filter(
      (p) =>
        (p.status === "paid" || p.status === "verified") &&
        p.paymentDate &&
        new Date(p.paymentDate).getTime() >= monthStart,
    )
    .reduce((s, p) => s + p.totalAmount, 0);

  return {
    totalOutstanding: open.reduce((s, p) => s + p.remainingBalance, 0),
    paidThisMonth,
    pendingPayments: open.filter((p) =>
      [
        "pending",
        "pending_payment",
        "payment_submitted",
        "verification_pending",
        "processing",
      ].includes(p.status),
    ).length,
    upcomingCreditDue: payments
      .filter(
        (p) =>
          (p.paymentType === "credit_15" || p.paymentType === "credit_30") &&
          ["pending", "overdue"].includes(p.status),
      )
      .reduce((s, p) => s + p.remainingBalance, 0),
    overduePayments: payments.filter((p) => p.status === "overdue").length,
    availableCredit:
      computeCredit15Summary(payments).availableCredit +
      computeCredit30Summary(payments).availableCredit,
  };
}

export function PaymentsDashboardPage() {
  const router = useRouter();
  const payments = usePaymentsCatalogStore((s) => s.payments);
  const notifications = usePaymentsCatalogStore((s) => s.notifications);
  const filters = usePaymentsCatalogStore((s) => s.filters);
  const isHydrated = usePaymentsCatalogStore((s) => s.isHydrated);

  useEffect(() => {
    const finish = () => usePaymentsCatalogStore.getState().setHydrated(true);
    const unsub = usePaymentsCatalogStore.persist.onFinishHydration(finish);
    if (usePaymentsCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const summary = useMemo(() => buildSummary(payments), [payments]);

  const recent = useMemo(
    () =>
      filterSortPayments(payments, {
        ...filters,
        search: "",
        status: "all",
        paymentType: "all",
        warehouse: "all",
        seller: "all",
        sortBy: "dueDate",
        sortDir: "asc",
      }).slice(0, 6),
    [payments, filters],
  );
  const unread = notifications.filter((n) => !n.read).slice(0, 5);

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
        title="Payments"
        description="Track advance, loading, delivery, and credit settlements across your procurement orders."
        breadcrumbs={[{ label: "Payments" }]}
      />

      <PaymentSummaryCards summary={summary} />
      <PaymentQuickActions />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-slate-200 shadow-card xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming & Pending</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => router.push(ROUTES.paymentsHistory)}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => router.push(paymentsDetailPath(p.id))}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3 text-left transition hover:border-brand/30 hover:bg-brand/[0.02]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {p.orderNumber} · {p.product}
                  </p>
                  <p className="text-xs text-slate-500">
                    Due {formatDateDdMmYyyy(p.dueDate)} · {p.seller}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="text-sm font-semibold">
                    {formatInr(p.totalAmount, { compact: true })}
                  </p>
                  <PaymentStatusChip status={p.status} />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <Bell className="h-4 w-4 text-brand" />
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unread.length === 0 ? (
              <p className="text-sm text-slate-500">No new notifications.</p>
            ) : (
              unread.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    usePaymentsCatalogStore
                      .getState()
                      .markNotificationRead(n.id);
                    if (n.paymentId) {
                      router.push(paymentsDetailPath(n.paymentId));
                    }
                  }}
                  className="w-full rounded-xl border border-slate-100 px-3 py-2.5 text-left hover:bg-slate-50"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                </button>
              ))
            )}
            <Button
              variant="ghost"
              className="w-full rounded-xl"
              onClick={() => router.push(ROUTES.paymentsHistory)}
            >
              <Eye className="h-4 w-4" />
              View Payment History
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
