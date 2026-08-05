"use client";

import type { MouseEvent } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AttentionBreakdown = {
  paymentPending: number;
  delayed: number;
  readyForDispatch: number;
};

interface OrdersRequiringAttentionCardProps {
  count: number;
  breakdown: AttentionBreakdown;
  active?: boolean;
  onSelectAll?: () => void;
  onSelectPaymentPending?: () => void;
  onSelectDelayed?: () => void;
  onSelectReadyForDispatch?: () => void;
  className?: string;
}

export function OrdersRequiringAttentionCard({
  count,
  breakdown,
  active = false,
  onSelectAll,
  onSelectPaymentPending,
  onSelectDelayed,
  onSelectReadyForDispatch,
  className,
}: OrdersRequiringAttentionCardProps) {
  const hasAttention = count > 0;

  const stopAnd =
    (handler?: () => void) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      handler?.();
    };

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={onSelectAll}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectAll?.();
        }
      }}
      className={cn(
        "cursor-pointer border-slate-200 shadow-card transition-colors hover:border-slate-300",
        active && "border-brand/40 ring-2 ring-brand/30",
        !hasAttention && "hover:border-emerald-200",
        className,
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "rounded-xl p-2.5",
              hasAttention
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700",
            )}
          >
            {hasAttention ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {hasAttention
                ? "Orders Requiring Attention"
                : "No Action Required"}
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{count}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {hasAttention
                ? "Requires action"
                : "All active orders are progressing normally."}
            </p>
          </div>
        </div>

        {hasAttention ? (
          <div className="flex flex-wrap gap-1.5">
            <BreakdownChip
              label="Payment Pending"
              count={breakdown.paymentPending}
              tone="amber"
              onClick={stopAnd(onSelectPaymentPending)}
            />
            <BreakdownChip
              label="Delayed"
              count={breakdown.delayed}
              tone="red"
              onClick={stopAnd(onSelectDelayed)}
            />
            <BreakdownChip
              label="Ready for Dispatch"
              count={breakdown.readyForDispatch}
              tone="blue"
              onClick={stopAnd(onSelectReadyForDispatch)}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function BreakdownChip({
  label,
  count,
  tone,
  onClick,
}: {
  label: string;
  count: number;
  tone: "amber" | "red" | "blue";
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
      : tone === "red"
        ? "bg-red-50 text-red-800 hover:bg-red-100"
        : "bg-sky-50 text-sky-800 hover:bg-sky-100";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors",
        toneClass,
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
