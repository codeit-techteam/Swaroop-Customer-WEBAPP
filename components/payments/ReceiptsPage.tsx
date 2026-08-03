"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye, Printer, Search, Share2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
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
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";
import type { ReceiptRecord } from "@/types/payments";

export function ReceiptsPage() {
  const receipts = usePaymentsCatalogStore((s) => s.receipts);
  const isHydrated = usePaymentsCatalogStore((s) => s.isHydrated);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ReceiptRecord | null>(null);

  useEffect(() => {
    const finish = () => usePaymentsCatalogStore.getState().setHydrated(true);
    const unsub = usePaymentsCatalogStore.persist.onFinishHydration(finish);
    if (usePaymentsCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return receipts;
    return receipts.filter((r) =>
      [
        r.receiptNumber,
        r.transactionId,
        r.orderNumber,
        r.paymentId,
        r.utrNumber,
        r.paymentMethod,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [receipts, search]);

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
        title="Receipts"
        description="Official payment receipts generated after successful verification."
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "Receipts" },
        ]}
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search receipt, transaction, UTR…"
          className="h-10 rounded-xl pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>Receipt Number</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id} className="hover:bg-brand/[0.02]">
                <TableCell className="font-medium">{r.receiptNumber}</TableCell>
                <TableCell className="font-mono text-xs">
                  {r.transactionId}
                </TableCell>
                <TableCell>{r.orderNumber}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatInr(r.totalAmount)}
                </TableCell>
                <TableCell>{r.paymentMethod}</TableCell>
                <TableCell>{formatDateDdMmYyyy(r.paymentDate)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                      onClick={() => setSelected(r)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                      onClick={() => toast.success("Receipt downloaded")}
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
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-center text-xs font-semibold uppercase tracking-widest text-brand">
                PetroTrade Technologies
              </p>
              <p className="pb-3 text-center text-lg font-semibold">
                {selected.receiptNumber}
              </p>
              <Row label="Payment ID" value={selected.paymentId} />
              <Row label="Order Number" value={selected.orderNumber} />
              <Row label="UTR Number" value={selected.utrNumber ?? "—"} />
              <Row label="Amount" value={formatInr(selected.amount)} />
              <Row label="GST" value={formatInr(selected.gst)} />
              <Row label="Total" value={formatInr(selected.totalAmount)} />
              <Row
                label="Payment Date"
                value={formatDateDdMmYyyy(selected.paymentDate)}
              />
              <Row
                label="Verification Date"
                value={
                  selected.verificationDate
                    ? formatDateDdMmYyyy(selected.verificationDate)
                    : "—"
                }
              />
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 rounded-xl bg-brand hover:bg-brand-700"
                  onClick={() => toast.success("Receipt downloaded")}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      `${selected.receiptNumber} · ${formatInr(selected.totalAmount)}`,
                    );
                    toast.success("Receipt details copied");
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-white/60 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
