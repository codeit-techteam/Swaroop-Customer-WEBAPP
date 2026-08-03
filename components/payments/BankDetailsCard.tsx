"use client";

import { useCallback } from "react";
import { Copy, Download, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PETROTRADE_TRANSFER_BANK } from "@/constants/payments";
import { formatInr } from "@/lib/format";
import type { TransferBankDetails } from "@/types/payments";

interface BankDetailsCardProps {
  details?: TransferBankDetails;
  amountToPay: number;
  deadlineLabel: string;
}

function Row({
  label,
  value,
  copyable,
  mono,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  mono?: boolean;
}) {
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  }, [label, value]);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p
          className={
            mono
              ? "truncate font-mono text-sm font-medium text-slate-900"
              : "truncate text-sm font-medium text-slate-900"
          }
        >
          {value}
        </p>
      </div>
      {copyable ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={copy}
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-4 w-4 text-brand" />
        </Button>
      ) : null}
    </div>
  );
}

export function BankDetailsCard({
  details = PETROTRADE_TRANSFER_BANK,
  amountToPay,
  deadlineLabel,
}: BankDetailsCardProps) {
  const downloadDetails = () => {
    const text = [
      "PetroTrade — Payment Details",
      `Beneficiary: ${details.beneficiaryName}`,
      `Bank: ${details.bankName}`,
      `Branch: ${details.branch}`,
      `Account: ${details.accountNumber}`,
      `IFSC: ${details.ifsc}`,
      `UPI: ${details.upiId}`,
      `Amount: ${formatInr(amountToPay)}`,
      `Deadline: ${deadlineLabel}`,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "petrotrade-payment-details.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Payment details downloaded");
  };

  return (
    <Card className="border-brand/20 bg-brand/5 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Company Bank Details</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={downloadDetails}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row
          label="Beneficiary Name"
          value={details.beneficiaryName}
          copyable
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <Row label="Bank Name" value={details.bankName} />
          <Row label="IFSC" value={details.ifsc} copyable mono />
        </div>
        <Row label="Branch" value={details.branch} />
        <Row
          label="Account Number"
          value={details.accountNumber}
          copyable
          mono
        />
        <Row label="UPI ID" value={details.upiId} copyable mono />

        <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-dashed border-brand/30 bg-white p-4">
          <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-slate-50">
            <QrCode className="h-16 w-16 text-brand" />
          </div>
          <p className="text-xs text-slate-500">{details.upiQrLabel}</p>
          <p className="text-sm font-semibold text-brand">
            Amount to Pay: {formatInr(amountToPay)}
          </p>
          <p className="text-xs text-slate-500">Deadline: {deadlineLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}
