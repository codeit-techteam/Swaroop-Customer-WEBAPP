"use client";

import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface BuyingSummaryProps {
  pricePerMt: number;
  quantity: number;
  freightPerMt: number;
  gstRate?: number;
  discountRate?: number;
  className?: string;
}

export function BuyingSummary({
  pricePerMt,
  quantity,
  freightPerMt,
  gstRate = 0.18,
  discountRate = 0,
  className,
}: BuyingSummaryProps) {
  const materialSubtotal = pricePerMt * quantity;
  const discount = Math.round(materialSubtotal * discountRate);
  const taxable = materialSubtotal - discount;
  const freight = freightPerMt * quantity;
  const gst = Math.round(taxable * gstRate);
  const grandTotal = taxable + freight + gst;

  const rows = [
    {
      label: "Price",
      value: formatInr(materialSubtotal, { compact: true }),
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
      value: formatInr(freight, { compact: true }),
    },
    {
      label: `Estimated GST (${Math.round(gstRate * 100)}%)`,
      value: formatInr(gst, { compact: true }),
    },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-100 bg-slate-50/80 p-3",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Buying Summary
      </p>
      <dl className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
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
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2">
          <dt className="text-sm font-semibold text-slate-900">Grand Total</dt>
          <dd className="text-sm font-bold tabular-nums text-brand">
            {formatInr(grandTotal, { compact: true })}
          </dd>
        </div>
      </dl>
    </div>
  );
}
