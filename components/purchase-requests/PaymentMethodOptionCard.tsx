"use client";

import {
  Calendar,
  CalendarCheck,
  Check,
  Package,
  Truck,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  PaymentBadgeVariant,
  PaymentMethod,
} from "@/types/purchase-request";

const ICON_MAP = {
  wallet: Wallet,
  truck: Truck,
  package: Package,
  calendar: Calendar,
  "calendar-check": CalendarCheck,
} as const;

const BADGE_CLASS: Record<PaymentBadgeVariant, string> = {
  recommended: "border-transparent bg-sky-50 text-sky-700",
  eligible: "border-transparent bg-slate-100 text-slate-700",
  credit: "border-transparent bg-emerald-50 text-emerald-700",
  premium: "border-transparent bg-amber-50 text-amber-800",
};

interface PaymentMethodOptionCardProps {
  method: PaymentMethod;
  selected: boolean;
  disabled?: boolean;
  onSelect: (id: PaymentMethod["id"]) => void;
}

export function PaymentMethodOptionCard({
  method,
  selected,
  disabled = false,
  onSelect,
}: PaymentMethodOptionCardProps) {
  const Icon = ICON_MAP[method.icon];

  return (
    <Card
      role="radio"
      aria-checked={selected}
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (!disabled) onSelect(method.id);
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(method.id);
        }
      }}
      className={cn(
        "cursor-pointer border-slate-200 transition-all",
        selected && "border-brand bg-brand/[0.03] ring-2 ring-brand/15",
        disabled && "cursor-not-allowed opacity-50",
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
                  {method.title}
                </h3>
                <p className="text-[11px] text-slate-500">{method.timing}</p>
              </div>
            </div>
            {method.badge ? (
              <Badge
                className={cn(
                  "shrink-0 text-[10px]",
                  BADGE_CLASS[method.badge.variant],
                )}
              >
                {method.badge.label}
              </Badge>
            ) : null}
          </div>

          {method.description ? (
            <p className="text-xs leading-relaxed text-slate-600">
              {method.description}
            </p>
          ) : null}

          {method.discount > 0 ? (
            <p className="text-xs font-semibold text-emerald-600">
              Save {formatInr(method.discount, { compact: true })}
            </p>
          ) : null}

          {method.hasCredit ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
              <span>
                Limit{" "}
                <strong className="text-slate-700">
                  {formatInr(method.creditLimit ?? 0, { compact: true })}
                </strong>
              </span>
              <span>
                Available{" "}
                <strong className="text-slate-700">
                  {formatInr(method.availableCredit ?? 0, { compact: true })}
                </strong>
              </span>
              <span>
                Interest{" "}
                <strong className="text-slate-700">
                  {method.interestRate}%
                </strong>
              </span>
            </div>
          ) : null}

          <ul className="grid gap-1 sm:grid-cols-2">
            {method.benefits.slice(0, 4).map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-1.5 text-[11px] text-slate-600"
              >
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                {benefit}
              </li>
            ))}
          </ul>

          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            Eligibility · {method.eligibility} · {method.risk}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
