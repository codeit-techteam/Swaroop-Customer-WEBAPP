"use client";

import { useEffect, useState } from "react";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CheckoutQuote } from "@/services/checkout";
import {
  fetchPricingEstimate,
  type PricingEstimate,
} from "@/services/pricing-estimate";

interface BuyingSummaryProps {
  quote?: CheckoutQuote | null;
  loading?: boolean;
  error?: string | null;
  offerId?: string;
  quantity?: number;
  /** Omit the Grand Total row when it is shown elsewhere (e.g. pinned checkout footer) */
  hideTotal?: boolean;
  className?: string;
}

function money(value: string | number | undefined | null) {
  const n = Number(value);
  return Number.isFinite(n) ? formatInr(n, { compact: true }) : "—";
}

export function BuyingSummary({
  quote,
  loading = false,
  error = null,
  offerId,
  quantity = 0,
  hideTotal = false,
  className,
}: BuyingSummaryProps) {
  const [estimate, setEstimate] = useState<PricingEstimate | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId || quantity <= 0) {
      setEstimate(null);
      setEstimateError(null);
      return;
    }
    let cancelled = false;
    setEstimateLoading(true);
    setEstimateError(null);
    void fetchPricingEstimate({ offerId, quantity })
      .then((data) => {
        if (!cancelled) setEstimate(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setEstimate(null);
          setEstimateError(
            err instanceof Error ? err.message : "Unable to load ₹/kg estimate",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setEstimateLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [offerId, quantity]);

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

  const unitMt = estimate?.unitPricePerMt ?? quote.unitPrice;
  const unitKg = estimate?.unitPricePerKg;
  const currency = (
    estimate?.currency ??
    quote.currency ??
    "INR"
  ).toUpperCase();
  const isInr = currency === "INR";

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition-opacity",
        (loading || estimateLoading) && "opacity-60",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Price Breakdown
      </p>

      <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-slate-100 bg-white/80 p-2.5">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            ₹ / MT
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
            {isInr ? money(unitMt) : `${currency} ${unitMt ?? "—"}`}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            ₹ / kg
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
            {unitKg
              ? isInr
                ? money(unitKg)
                : `${currency} ${unitKg}`
              : estimateLoading
                ? "…"
                : "—"}
          </p>
        </div>
      </div>

      {estimate && !isInr ? (
        <p className="mt-2 text-[11px] leading-relaxed text-amber-700">
          {estimate.note ??
            "Offer currency is not INR. No foreign→INR conversion without a configured exchange rate."}
        </p>
      ) : null}

      {estimate?.exTax && isInr ? (
        <dl className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs text-slate-500">Ex-tax (taxable)</dt>
            <dd className="text-xs font-semibold tabular-nums text-slate-800">
              {money(estimate.exTax.taxable)}
            </dd>
          </div>
          {estimate.tax ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-xs text-slate-500">
                Tax ({(estimate.tax.bps / 100).toFixed(2)}%)
              </dt>
              <dd className="text-xs font-semibold tabular-nums text-slate-800">
                {money(estimate.tax.amount)}
              </dd>
            </div>
          ) : null}
          {estimate.inclusiveTotal ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-xs text-slate-500">Inclusive total</dt>
              <dd className="text-xs font-semibold tabular-nums text-slate-800">
                {money(estimate.inclusiveTotal)}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {estimateError ? (
        <p className="mt-2 text-[11px] text-slate-500">{estimateError}</p>
      ) : null}

      <dl className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
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
