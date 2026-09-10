"use client";

import type { CreditAccountStatus } from "@/types/credit-application";
import { formatInr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CreditStatusCardProps {
  status: CreditAccountStatus;
  approvedLimit: number;
  availableCredit: number;
  creditUsed: number;
  paymentTerms: string;
  compact?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  CreditAccountStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "outline" }
> = {
  approved: { label: "Approved", variant: "success" },
  pending: { label: "Pending Review", variant: "warning" },
  rejected: { label: "Rejected", variant: "destructive" },
  not_applied: { label: "Not Applied", variant: "outline" },
};

export function CreditStatusCard({
  status,
  approvedLimit,
  availableCredit,
  creditUsed,
  paymentTerms,
  compact = false,
  className,
}: CreditStatusCardProps) {
  const statusMeta = STATUS_CONFIG[status];

  if (compact) {
    return (
      <div
        className={cn(
          "flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusMeta.variant} className="rounded-full px-2.5">
            Active facility
          </Badge>
          <p className="text-sm text-slate-600">
            Current limit stays live while you apply for additional credit.
          </p>
        </div>
        <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <div className="flex gap-1.5">
            <dt className="text-slate-400">Limit</dt>
            <dd className="font-semibold tabular-nums text-slate-900">
              {formatInr(approvedLimit)}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-slate-400">Available</dt>
            <dd className="font-semibold tabular-nums text-emerald-600">
              {formatInr(availableCredit)}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-slate-400">Terms</dt>
            <dd className="font-semibold text-slate-900">{paymentTerms}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <Card className={cn("border-slate-200 shadow-card", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">
          Current Credit Status
        </CardTitle>
        <Badge variant={statusMeta.variant} className="rounded-full px-2.5">
          {statusMeta.label}
        </Badge>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Stat
            label="Approved Credit Limit"
            value={formatInr(approvedLimit)}
          />
          <Stat
            label="Available Credit"
            value={formatInr(availableCredit)}
            highlight="text-emerald-600"
          />
          <Stat label="Credit Used" value={formatInr(creditUsed)} />
          <Stat label="Payment Terms" value={paymentTerms} />
          <Stat label="Status" value={statusMeta.label} />
        </dl>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-base font-semibold tabular-nums text-slate-900",
          highlight,
        )}
      >
        {value}
      </dd>
    </div>
  );
}
