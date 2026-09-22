"use client";

import { formatInr, formatQuantityMt } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CheckoutProductLine = {
  id: string;
  title: string;
  subtitle: string;
  quantityMt: number;
  packaging: string;
};

export type CheckoutOrderSummary = {
  baseSubtotal: number;
  discount: number;
  freight: number;
  freightLabel: string;
  gst: number;
  gstLabel: string;
  platformFee: number;
  insuranceIncluded: boolean;
  insuranceAmount: number;
  totalPayable: number;
  totalQuantityMt: number;
};

function SummaryRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 text-[13px]">
      <span className={muted ? "text-slate-400" : "text-slate-500"}>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          muted ? "text-slate-400" : "font-medium text-slate-800",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function OrderSummaryCard({
  products,
  summary,
  paymentLabel,
  expiresLabel,
}: {
  products: CheckoutProductLine[];
  summary: CheckoutOrderSummary;
  paymentLabel?: string | null;
  expiresLabel?: string | null;
}) {
  const primary = products[0];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center justify-between bg-brand px-5 py-3">
        <p className="text-[11px] font-semibold tracking-[1.2px] text-white">
          ORDER SUMMARY
        </p>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-medium text-white">
          B2B Contract
        </span>
      </div>
      <div className="p-5">
        {primary ? (
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-slate-900">
                {primary.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{primary.subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold tabular-nums text-accent-blue">
                {formatQuantityMt(primary.quantityMt)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {primary.packaging}
              </p>
            </div>
          </div>
        ) : null}

        {products.length > 1 ? (
          <div className="mb-4 space-y-2">
            {products.slice(1).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="min-w-0 truncate text-slate-600">
                  {product.title}
                </span>
                <span className="shrink-0 font-medium tabular-nums text-slate-800">
                  {formatQuantityMt(product.quantityMt)}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mb-4 h-px bg-slate-100" />

        <SummaryRow
          label="Base Amount"
          value={formatInr(summary.baseSubtotal, { compact: true })}
        />
        {summary.discount > 0 ? (
          <SummaryRow
            label="Discount"
            value={`−${formatInr(summary.discount, { compact: true })}`}
          />
        ) : null}
        <SummaryRow
          label={summary.freightLabel}
          value={formatInr(summary.freight, { compact: true })}
        />
        <SummaryRow
          label={summary.gstLabel}
          value={formatInr(summary.gst, { compact: true })}
        />
        <SummaryRow
          label="Platform Fee"
          value={formatInr(summary.platformFee, { compact: true })}
          muted
        />
        <SummaryRow
          label="Insurance"
          value={
            summary.insuranceIncluded
              ? "Included"
              : formatInr(summary.insuranceAmount, { compact: true })
          }
          muted
        />
        {paymentLabel ? (
          <SummaryRow label="Payment" value={paymentLabel} />
        ) : null}

        <div className="my-4 border-t border-dashed border-slate-200" />

        <div className="flex items-end justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">Total Payable</p>
          <p className="text-[22px] font-semibold tabular-nums text-accent-blue">
            {formatInr(summary.totalPayable, { compact: true })}
          </p>
        </div>
        {expiresLabel ? (
          <p className="mt-2 text-[11px] text-slate-400">{expiresLabel}</p>
        ) : null}
      </div>
    </section>
  );
}
