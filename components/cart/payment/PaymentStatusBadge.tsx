"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CheckoutPaymentStatus } from "@/types/checkout-payment";

const STATUS_META: Record<
  CheckoutPaymentStatus,
  { label: string; className: string }
> = {
  not_selected: {
    label: "Not Selected",
    className: "border-transparent bg-slate-100 text-slate-600",
  },
  pending_seller_approval: {
    label: "Pending Seller Approval",
    className: "border-transparent bg-amber-50 text-amber-800",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    className: "border-transparent bg-sky-50 text-sky-800",
  },
  payment_pending_delivery: {
    label: "Pay At Delivery",
    className: "border-transparent bg-violet-50 text-violet-800",
  },
  credit_allocated: {
    label: "Credit Allocated",
    className: "border-transparent bg-emerald-50 text-emerald-800",
  },
  paid: {
    label: "Paid",
    className: "border-transparent bg-emerald-50 text-emerald-800",
  },
  due: {
    label: "Payment Due",
    className: "border-transparent bg-rose-50 text-rose-800",
  },
};

interface PaymentStatusBadgeProps {
  status: CheckoutPaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <Badge
      className={cn("rounded-full text-[10px]", meta.className, className)}
    >
      {meta.label}
    </Badge>
  );
}
