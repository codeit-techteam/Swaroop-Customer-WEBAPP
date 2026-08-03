"use client";

import { cn } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS } from "@/constants/payments";
import type { PaymentStatus } from "@/types/payments";

const STATUS_CLASS: Record<PaymentStatus, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  pending_payment: "bg-amber-50 text-amber-800 border-amber-200",
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  processing: "bg-sky-50 text-sky-800 border-sky-200",
  payment_submitted: "bg-sky-50 text-sky-800 border-sky-200",
  verification_pending: "bg-indigo-50 text-indigo-800 border-indigo-200",
  verified: "bg-emerald-50 text-emerald-800 border-emerald-200",
  failed: "bg-red-50 text-red-800 border-red-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
  overdue: "bg-red-50 text-red-800 border-red-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  refunded: "bg-violet-50 text-violet-800 border-violet-200",
  need_clarification: "bg-orange-50 text-orange-800 border-orange-200",
};

interface PaymentStatusChipProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusChip({
  status,
  className,
}: PaymentStatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_CLASS[status],
        className,
      )}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
