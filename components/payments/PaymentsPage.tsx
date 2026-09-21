"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, IndianRupee, Navigation, Truck } from "lucide-react";
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
import {
  PAYMENT_TYPE_LABELS,
  paymentsAdvancePayPath,
  paymentsDetailPath,
} from "@/constants/payments";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import {
  filterSortPayments,
  usePaymentsCatalogStore,
} from "@/store/paymentsCatalogStore";
import type { PaymentRecord, PaymentTypeId } from "@/types/payments";
import { PaymentFiltersBar } from "./PaymentFiltersBar";
import { PaymentsPageSkeleton } from "./payments-page-skeleton";
import { PaymentStatusChip } from "./PaymentStatusChip";
import {
  PaymentTypeFilterChips,
  parsePaymentTypeFilter,
  type PaymentTypeFilter,
} from "./PaymentTypeFilterChips";

const PAYABLE_STATUSES = new Set([
  "pending",
  "pending_payment",
  "overdue",
  "rejected",
  "need_clarification",
  "failed",
  "processing",
]);

function typeFilterLabel(type: PaymentTypeFilter): string {
  if (type === "all") return "All Payments";
  return PAYMENT_TYPE_LABELS[type];
}

function canPay(payment: PaymentRecord): boolean {
  return PAYABLE_STATUSES.has(payment.status);
}

export function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const payments = usePaymentsCatalogStore((s) => s.payments);
  const filters = usePaymentsCatalogStore((s) => s.filters);
  const setFilters = usePaymentsCatalogStore((s) => s.setFilters);
  const resetFilters = usePaymentsCatalogStore((s) => s.resetFilters);
  const page = usePaymentsCatalogStore((s) => s.page);
  const pageSize = usePaymentsCatalogStore((s) => s.pageSize);
  const setPage = usePaymentsCatalogStore((s) => s.setPage);
  const payOnLoading = usePaymentsCatalogStore((s) => s.payOnLoading);
  const payOnDelivery = usePaymentsCatalogStore((s) => s.payOnDelivery);
  const payCredit = usePaymentsCatalogStore((s) => s.payCredit);
  const isHydrated = usePaymentsCatalogStore((s) => s.isHydrated);

  const typeFilter = parsePaymentTypeFilter(searchParams.get("type"));

  useEffect(() => {
    setFilters({
      paymentType: typeFilter === "all" ? "all" : typeFilter,
    });
    setPage(1);
  }, [typeFilter, setFilters, setPage]);

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

  const typeCounts = useMemo(() => {
    const counts: Record<PaymentTypeFilter, number> = {
      all: payments.length,
      advance: 0,
      on_loading: 0,
      on_delivery: 0,
      credit_15: 0,
      credit_30: 0,
    };
    for (const p of payments) {
      counts[p.paymentType]++;
    }
    return counts;
  }, [payments]);

  const filtered = useMemo(
    () => filterSortPayments(payments, filters),
    [payments, filters],
  );

  const pendingCount = filtered.filter((p) => canPay(p)).length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const rows = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const hasDropdownFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.warehouse !== "all" ||
    filters.seller !== "all" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  function setTypeFilter(next: PaymentTypeFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("type");
    } else {
      params.set("type", next);
    }
    const query = params.toString();
    router.replace(query ? `${ROUTES.payments}?${query}` : ROUTES.payments);
  }

  function handlePay(payment: PaymentRecord) {
    switch (payment.paymentType) {
      case "advance":
        router.push(paymentsAdvancePayPath(payment.id));
        return;
      case "on_loading":
        payOnLoading(payment.id);
        toast.success("Loading payment completed");
        return;
      case "on_delivery":
        payOnDelivery(payment.id);
        toast.success("Delivery payment completed");
        return;
      case "credit_15":
      case "credit_30":
        payCredit(payment.id);
        toast.success("Credit payment settled");
        return;
      default:
        router.push(paymentsDetailPath(payment.id));
    }
  }

  function payLabel(type: PaymentTypeId): string {
    if (type === "credit_15" || type === "credit_30") return "Pay Credit";
    return "Pay Now";
  }

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
        title="Payments"
        description="View and settle advance, loading, delivery, and credit payments. Use filters to narrow by payment type and status."
        breadcrumbs={[{ label: "Payments" }]}
        actions={
          <Button
            className="rounded-xl bg-brand hover:bg-brand-700"
            onClick={() => router.push(ROUTES.paymentsRequestCredit)}
          >
            Request Credit
          </Button>
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-card">
        <strong className="text-slate-900">{filtered.length}</strong>{" "}
        {typeFilter === "all"
          ? "payments"
          : typeFilterLabel(typeFilter).toLowerCase()}{" "}
        · <strong className="text-amber-700">{pendingCount}</strong> awaiting
        action
      </div>

      <PaymentTypeFilterChips
        value={typeFilter}
        counts={typeCounts}
        onChange={setTypeFilter}
      />

      <PaymentFiltersBar
        filters={filters}
        warehouses={warehouses}
        sellers={sellers}
        onChange={(patch) => {
          setFilters(patch);
          setPage(1);
        }}
        onReset={() => {
          resetFilters();
          setFilters({
            paymentType: typeFilter === "all" ? "all" : typeFilter,
          });
          setPage(1);
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>Order</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Supply Source</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="w-[1%] whitespace-nowrap text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer hover:bg-brand/[0.02]"
                onClick={() => router.push(paymentsDetailPath(p.id))}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{p.orderNumber}</p>
                    <p className="text-xs text-slate-400">{p.poNumber}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-[180px] truncate">
                  {p.product}
                </TableCell>
                <TableCell>{PAYMENT_TYPE_LABELS[p.paymentType]}</TableCell>
                <TableCell>{p.seller}</TableCell>
                <TableCell>{formatDateDdMmYyyy(p.dueDate)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatInr(p.totalAmount)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <PaymentStatusChip status={p.status} />
                </TableCell>
                <TableCell
                  className="w-[1%] whitespace-nowrap text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end gap-1">
                    {p.paymentType === "on_delivery" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg"
                        onClick={() => router.push(ROUTES.shipmentTracking)}
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {p.paymentType === "on_loading" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg"
                        title={`Loading ${p.loadingPercent ?? 0}%`}
                        onClick={() => router.push(paymentsDetailPath(p.id))}
                      >
                        <Truck className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {canPay(p) ? (
                      <Button
                        size="sm"
                        className="rounded-lg bg-brand hover:bg-brand-700"
                        onClick={() => handlePay(p)}
                      >
                        <IndianRupee className="h-4 w-4" />
                        {payLabel(p.paymentType)}
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                      onClick={() => router.push(paymentsDetailPath(p.id))}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No payments match your filters.
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Showing {rows.length} of {filtered.length}
          {hasDropdownFilters ? " · filters applied" : ""}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={pageSafe <= 1}
            onClick={() => setPage(pageSafe - 1)}
          >
            Previous
          </Button>
          <span className="px-2 py-1">
            {pageSafe} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage(pageSafe + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
