"use client";

import { useEffect, useMemo } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PaymentsPageSkeleton } from "./payments-page-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/constants";
import {
  filterSortPayments,
  usePaymentsCatalogStore,
} from "@/store/paymentsCatalogStore";
import { AdvancePaymentCard } from "./AdvancePaymentCard";
import { PaymentFiltersBar } from "./PaymentFiltersBar";

export function AdvancePaymentPage() {
  const payments = usePaymentsCatalogStore((s) => s.payments);
  const filters = usePaymentsCatalogStore((s) => s.filters);
  const setFilters = usePaymentsCatalogStore((s) => s.setFilters);
  const resetFilters = usePaymentsCatalogStore((s) => s.resetFilters);
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
    () => filterSortPayments(payments, filters, "advance"),
    [payments, filters],
  );

  const pendingCount = list.filter((p) =>
    [
      "pending",
      "pending_payment",
      "overdue",
      "rejected",
      "need_clarification",
    ].includes(p.status),
  ).length;

  if (!isHydrated) {
    return (
      <PageContainer>
        <PaymentsPageSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Advance Payment"
        description="Orders requiring 100% advance payment before processing. Transfer exact amount and upload UTR for verification."
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "Advance Payment" },
        ]}
      />

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-card">
        <strong className="text-slate-900">{list.length}</strong> advance
        payments · <strong className="text-amber-700">{pendingCount}</strong>{" "}
        awaiting action
      </div>

      <PaymentFiltersBar
        filters={filters}
        warehouses={warehouses}
        sellers={sellers}
        onChange={setFilters}
        onReset={resetFilters}
        hideType
        searchPlaceholder="Search order, PO, invoice, product, UTR…"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((p) => (
          <AdvancePaymentCard key={p.id} payment={p} />
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          No advance payments match your filters.
        </div>
      ) : null}
    </PageContainer>
  );
}
