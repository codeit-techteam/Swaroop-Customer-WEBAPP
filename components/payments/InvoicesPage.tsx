"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye, Printer, Search } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PaymentsPageSkeleton } from "./payments-page-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
} from "@/constants/payments";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";
import type { InvoiceRecord } from "@/types/payments";
import { PaymentStatusChip } from "./PaymentStatusChip";

export function InvoicesPage() {
  const invoices = usePaymentsCatalogStore((s) => s.invoices);
  const isHydrated = usePaymentsCatalogStore((s) => s.isHydrated);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<InvoiceRecord | null>(null);

  useEffect(() => {
    const finish = () => usePaymentsCatalogStore.getState().setHydrated(true);
    const unsub = usePaymentsCatalogStore.persist.onFinishHydration(finish);
    if (usePaymentsCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((i) =>
      [
        i.invoiceNumber,
        i.orderNumber,
        i.poNumber,
        i.seller,
        i.warehouse,
        i.transactionId,
        i.utrNumber,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [invoices, search]);

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
        title="Invoices"
        description="Tax invoices linked to purchase orders and advance payment verification."
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "Invoices" },
        ]}
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search invoice, order, UTR…"
          className="h-10 rounded-xl pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>Invoice Number</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">GST</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Advance Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-brand/[0.02]">
                <TableCell className="font-medium">
                  {inv.invoiceNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p>{inv.orderNumber}</p>
                    <p className="text-xs text-slate-400">
                      {PAYMENT_TYPE_LABELS[inv.paymentType]}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatInr(inv.amount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatInr(inv.gst)}
                </TableCell>
                <TableCell>{formatDateDdMmYyyy(inv.issueDate)}</TableCell>
                <TableCell>
                  {inv.advancePaymentStatus ? (
                    <PaymentStatusChip status={inv.advancePaymentStatus} />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="capitalize">{inv.status}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                      onClick={() => setSelected(inv)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                      onClick={() => toast.success("PDF download started")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                      onClick={() => window.print()}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-2 text-sm">
              <Row label="Order" value={selected.orderNumber} />
              <Row label="PO" value={selected.poNumber} />
              <Row label="Supply Source" value={selected.seller} />
              <Row label="Warehouse" value={selected.warehouse} />
              <Row label="Amount" value={formatInr(selected.amount)} />
              <Row label="GST" value={formatInr(selected.gst)} />
              <Row label="Total" value={formatInr(selected.totalAmount)} />
              <Row
                label="Advance Status"
                value={
                  selected.advancePaymentStatus
                    ? PAYMENT_STATUS_LABELS[selected.advancePaymentStatus]
                    : "—"
                }
              />
              <Row
                label="Transaction ID"
                value={selected.transactionId ?? "—"}
              />
              <Row label="UTR" value={selected.utrNumber ?? "—"} />
              <Row
                label="Verification Date"
                value={
                  selected.verificationDate
                    ? formatDateDdMmYyyy(selected.verificationDate)
                    : "—"
                }
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
