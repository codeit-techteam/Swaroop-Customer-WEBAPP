"use client";

import { Badge } from "@/components/ui/badge";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CheckoutCreditProfile } from "@/types/checkout-payment";

interface CreditBadgeProps {
  profile: CheckoutCreditProfile;
  className?: string;
}

export function CreditBadge({ profile, className }: CreditBadgeProps) {
  if (!profile.approved) {
    return (
      <Badge
        className={cn(
          "rounded-full border-transparent bg-slate-100 text-[10px] text-slate-600",
          className,
        )}
      >
        Credit Not Available
      </Badge>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Badge className="rounded-full border-transparent bg-emerald-50 text-[10px] text-emerald-800">
        Credit Available
      </Badge>
      <span className="text-xs font-semibold tabular-nums text-emerald-700">
        {formatInr(profile.availableCredit, { compact: true })}
      </span>
    </div>
  );
}
