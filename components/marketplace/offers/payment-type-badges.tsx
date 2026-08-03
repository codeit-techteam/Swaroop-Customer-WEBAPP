"use client";

import { Badge } from "@/components/ui/badge";
import type { OfferPaymentType } from "@/types/offers";
import { cn } from "@/lib/utils";

const PAYMENT_LABELS: Record<OfferPaymentType, string> = {
  advance: "Advance",
  on_loading: "On Loading",
  on_delivery: "On Delivery",
  credit_15: "Credit 15",
  credit_30: "Credit 30",
};

interface PaymentTypeBadgesProps {
  types: OfferPaymentType[];
  className?: string;
  size?: "sm" | "md";
}

export function PaymentTypeBadges({
  types,
  className,
  size = "sm",
}: PaymentTypeBadgesProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {types.map((type) => (
        <Badge
          key={type}
          variant={type.startsWith("credit") ? "info" : "secondary"}
          className={cn(
            "border-slate-200 font-semibold",
            size === "sm" && "px-1.5 py-0 text-[10px]",
            size === "md" && "px-2.5 py-0.5 text-xs",
          )}
        >
          {PAYMENT_LABELS[type]}
        </Badge>
      ))}
    </div>
  );
}
