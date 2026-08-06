"use client";

import { Check, Package, Truck, Wallet, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { CreditBadge } from "./CreditBadge";
import type {
  CheckoutCreditProfile,
  CheckoutPaymentBadgeVariant,
  CheckoutPaymentMethodId,
  CheckoutPaymentOption,
} from "@/types/checkout-payment";

const ICON_MAP = {
  wallet: Wallet,
  package: Package,
  truck: Truck,
  calendar: Calendar,
} as const;

const BADGE_CLASS: Record<CheckoutPaymentBadgeVariant, string> = {
  recommended: "border-transparent bg-sky-50 text-sky-700",
  approval: "border-transparent bg-amber-50 text-amber-800",
  credit: "border-transparent bg-emerald-50 text-emerald-700",
  unavailable: "border-transparent bg-slate-100 text-slate-600",
};

interface PaymentMethodCardProps {
  option: CheckoutPaymentOption;
  selected: boolean;
  disabled?: boolean;
  creditProfile?: CheckoutCreditProfile;
  showApprovalBadgeWhenSelected?: boolean;
  onSelect: (id: CheckoutPaymentMethodId) => void;
  children?: React.ReactNode;
}

export function PaymentMethodCard({
  option,
  selected,
  disabled = false,
  creditProfile,
  showApprovalBadgeWhenSelected,
  onSelect,
  children,
}: PaymentMethodCardProps) {
  const Icon = ICON_MAP[option.icon];
  const creditUnavailable =
    option.isCredit && creditProfile && !creditProfile.approved;
  const isDisabled = disabled || Boolean(creditUnavailable);

  const badge =
    option.id === "on_delivery" && selected && showApprovalBadgeWhenSelected
      ? { label: "Approval Required", variant: "approval" as const }
      : option.isCredit && creditUnavailable
        ? { label: "Credit Not Available", variant: "unavailable" as const }
        : option.badge;

  return (
    <Card
      role="radio"
      aria-checked={selected}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      onClick={() => {
        if (!isDisabled) onSelect(option.id);
      }}
      onKeyDown={(e) => {
        if (isDisabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(option.id);
        }
      }}
      className={cn(
        "cursor-pointer border-slate-200 transition-all",
        selected && "border-brand bg-brand/[0.03] ring-2 ring-brand/15",
        isDisabled && "cursor-not-allowed opacity-55",
      )}
    >
      <CardContent className="flex gap-3 p-4">
        <span
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
            selected ? "border-brand" : "border-slate-300",
          )}
        >
          {selected ? (
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
          ) : null}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-brand">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {option.title}
                </h3>
                <p className="text-[11px] text-slate-500">{option.timing}</p>
              </div>
            </div>
            {badge ? (
              <Badge
                className={cn(
                  "shrink-0 text-[10px]",
                  BADGE_CLASS[badge.variant],
                )}
              >
                {badge.label}
              </Badge>
            ) : null}
          </div>

          <p className="text-xs leading-relaxed text-slate-600">
            {option.description}
          </p>

          {option.isCredit && creditProfile ? (
            creditProfile.approved ? (
              <CreditBadge profile={creditProfile} />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <CreditBadge profile={creditProfile} />
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={ROUTES.paymentsRequestCredit}>Apply Credit</Link>
                </Button>
              </div>
            )
          ) : null}

          <ul className="grid gap-1 sm:grid-cols-2">
            {option.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-1.5 text-[11px] text-slate-600"
              >
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                {benefit}
              </li>
            ))}
          </ul>

          {children}
        </div>
      </CardContent>
    </Card>
  );
}
