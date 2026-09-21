"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, FileDown } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PaymentsPageSkeleton } from "./payments-page-skeleton";
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
import { PAYMENT_TYPE_LABELS, paymentsDetailPath } from "@/constants/payments";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import {
  filterSortPayments,
  usePaymentsCatalogStore,
} from "@/store/paymentsCatalogStore";
import { PaymentFiltersBar } from "./PaymentFiltersBar";
import { PaymentStatusChip } from "./PaymentStatusChip";

const HISTORY_STATUSES = new Set([
  "paid",
  "verified",
  "refunded",
  "cancelled",
  "failed",
  "verification_pending",
  "payment_submitted",
  "processing",
]);

export function PaymentHistoryPage() {
  const router = useRouter();
  const payments = usePaymentsCatalogStore((s) => s.payments);
  const filters = usePaymentsCatalogStore((s) => s.filters);
  const setFilters = usePaymentsCatalogStore((s) => s.setFilters);
  const resetFilters = usePaymentsCatalogStore((s) => s.resetFilters);
  const page = usePaymentsCatalogStore((s) => s.page);
  const pageSize = usePaymentsCatalogStore((s) => s.pageSize);
  const setPage = usePaymentsCatalogStore((s) => s.setPage);
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

  const filtered = useMemo(() => {
    const base = filterSortPayments(payments, {
      ...filters,
      sortBy: filters.sortBy === "dueDate" ? "paymentDate" : filters.sortBy,
    });
    return base.filter(
      (p) =>
        HISTORY_STATUSES.has(p.status) ||
        p.amountPaid > 0 ||
        Boolean(p.utrNumber),
    );
  }, [payments, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const rows = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const exportCsv = () => {
    const header = [
      "Payment ID",
      "Order",
      "Invoice",
      "Transaction ID",
      "Method",
      "Type",
      "Amount",
      "Date",
      "Status",
    ];
    const lines = filtered.map((p) =>
      [
        p.paymentId,
        p.orderNumber,
        p.invoiceNumber ?? "",
        p.transactionId ?? "",
        p.paymentMethod ?? "",
        PAYMENT_TYPE_LABELS[p.paymentType],
        p.totalAmount,
        p.paymentDate ? formatDateDdMmYyyy(p.paymentDate) : "",
        p.status,
      ].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payment-history.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

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
        title="Payment History"
        description="Complete ledger of submitted, verified, and settled payments."
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "Payment History" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={exportCsv}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => toast.success("PDF export started")}
            >
              <FileDown className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        }
      />

      <PaymentFiltersBar
        filters={filters}
        warehouses={warehouses}
        sellers={sellers}
        onChange={setFilters}
        onReset={resetFilters}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>Payment ID</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer hover:bg-brand/[0.02]"
                onClick={() => router.push(paymentsDetailPath(p.id))}
              >
                <TableCell className="font-medium">{p.paymentId}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{p.orderNumber}</p>
                    <p className="text-xs text-slate-400">{p.poNumber}</p>
                  </div>
                </TableCell>
                <TableCell>{p.invoiceNumber ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">
                  {p.transactionId ?? "—"}
                </TableCell>
                <TableCell>{p.paymentMethod ?? "—"}</TableCell>
                <TableCell>{PAYMENT_TYPE_LABELS[p.paymentType]}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatInr(p.totalAmount)}
                </TableCell>
                <TableCell>
                  {p.paymentDate ? formatDateDdMmYyyy(p.paymentDate) : "—"}
                </TableCell>
                <TableCell>
                  <PaymentStatusChip status={p.status} />
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-lg"
                    onClick={() => router.push(paymentsDetailPath(p.id))}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No payment history matches your filters.
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Showing {rows.length} of {filtered.length}
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
