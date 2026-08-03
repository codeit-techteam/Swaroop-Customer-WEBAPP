"use client";

import { cn } from "@/lib/utils";
import { paymentBadgeTone } from "@/mock/orders-catalog";
import type { PaymentMethodId } from "@/types/purchase-request";

const TONE_CLASS = {
  sky: "bg-sky-50 text-sky-800 border-sky-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  violet: "bg-violet-50 text-violet-800 border-violet-200",
  emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
  orange: "bg-orange-50 text-orange-800 border-orange-200",
} as const;

interface OrderPaymentBadgeProps {
  methodId: PaymentMethodId;
  title: string;
  className?: string;
}

export function OrderPaymentBadge({
  methodId,
  title,
  className,
}: OrderPaymentBadgeProps) {
  const tone = paymentBadgeTone(methodId);
  return (
    <span
      className={cn(
        "inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold",
        TONE_CLASS[tone],
        className,
      )}
    >
      {title}
    </span>
  );
}
