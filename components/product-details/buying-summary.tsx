"use client";

import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CheckoutQuote } from "@/services/checkout";

interface BuyingSummaryProps {
  quote?: CheckoutQuote | null;
  loading?: boolean;
  error?: string | null;
  /** Omit the Grand Total row when it is shown elsewhere (e.g. pinned checkout footer) */
  hideTotal?: boolean;
  className?: string;
}

export function BuyingSummary({
  quote,
  loading = false,
  error = null,
  hideTotal = false,
  className,
}: BuyingSummaryProps) {
  if (error) {
    return (
      <div
        className={cn(
          "rounded-xl border border-red-100 bg-red-50/70 p-3",
          className,
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-red-500">
          Price Breakdown
        </p>
        <p className="mt-2 text-xs text-red-700">{error}</p>
      </div>
    );
  }

  if (loading && !quote) {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-100 bg-slate-50/80 p-3",
          className,
        )}
        aria-busy="true"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Price Breakdown
        </p>
        <div className="mt-2.5 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="h-2.5 w-20 animate-pulse rounded bg-slate-200" />
              <span className="h-2.5 w-14 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-100 bg-slate-50/80 p-3",
          className,
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Price Breakdown
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Unable to load latest pricing
        </p>
      </div>
    );
  }

  const discount = Number(quote.discountAmount);
  const rows = [
    {
      label: "Price",
      value: formatInr(Number(quote.baseAmount), { compact: true }),
    },
    ...(discount > 0
      ? [
          {
            label: "Discount",
            value: `−${formatInr(discount, { compact: true })}`,
            accent: true as const,
          },
        ]
      : []),
    {
      label: "Estimated Freight",
      value: formatInr(Number(quote.freightAmount), { compact: true }),
    },
    {
      label: `Estimated GST (${quote.taxRate}%)`,
      value: formatInr(Number(quote.taxAmount), { compact: true }),
    },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition-opacity",
        loading && "opacity-60",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Price Breakdown
      </p>
      <dl className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3"
          >
            <dt className="text-xs text-slate-500">{row.label}</dt>
            <dd
              className={cn(
                "text-xs font-semibold tabular-nums text-slate-800",
                "accent" in row && row.accent && "text-emerald-700",
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
        {!hideTotal ? (
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2">
            <dt className="text-sm font-semibold text-slate-900">
              Grand Total
            </dt>
            <dd className="text-sm font-bold tabular-nums text-brand">
              {formatInr(Number(quote.totalAmount), { compact: true })}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
