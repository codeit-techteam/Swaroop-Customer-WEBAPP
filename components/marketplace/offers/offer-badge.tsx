"use client";

import { Badge } from "@/components/ui/badge";
import {
  getOfferStatus,
  getOfferTypeLabel,
  getStatusLabel,
} from "@/lib/offer-utils";
import type { MarketplaceOffer } from "@/types/offers";
import { cn } from "@/lib/utils";

interface OfferBadgeProps {
  offer: MarketplaceOffer;
  variant?: "discount" | "type" | "status" | "credit";
  className?: string;
}

export function OfferBadge({
  offer,
  variant = "discount",
  className,
}: OfferBadgeProps) {
  if (variant === "discount") {
    return (
      <Badge variant="success" className={cn("font-bold", className)}>
        {offer.discountPercent}% OFF
      </Badge>
    );
  }

  if (variant === "type") {
    return (
      <Badge
        className={cn(
          "border-0 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/10",
          className,
        )}
      >
        {getOfferTypeLabel(offer.offerType)}
      </Badge>
    );
  }

  if (variant === "credit" && offer.creditEligible) {
    return (
      <Badge
        className={cn(
          "border-0 bg-violet-50 text-violet-700 hover:bg-violet-50",
          className,
        )}
      >
        Credit Eligible
      </Badge>
    );
  }

  const status = getOfferStatus(offer);
  const label = getStatusLabel(status);

  const statusStyles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    ending_soon: "bg-amber-50 text-amber-700",
    expired: "bg-slate-100 text-slate-500",
    sold_out: "bg-red-50 text-red-600",
    upcoming: "bg-sky-50 text-sky-700",
    claimed: "bg-slate-100 text-slate-600",
  };

  return (
    <Badge
      className={cn(
        "border-0",
        statusStyles[status] ?? "bg-slate-100 text-slate-600",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
