"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatInr, formatInrPerMt, formatQuantityMt } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  OrderSummaryBreakdown,
  PaymentMethodId,
  SelectedProduct,
} from "@/types/purchase-request";
import { getPaymentMethodById } from "@/mock/purchase-request";

interface OrderSummaryProps {
  product: SelectedProduct;
  summary: OrderSummaryBreakdown;
  paymentMethodId: PaymentMethodId;
  sticky?: boolean;
  className?: string;
  footer?: ReactNode;
}

function SummaryRow({
  label,
  value,
  muted,
  emphasize,
  negative,
}: {
  label: string;
  value: string;
  muted?: boolean;
  emphasize?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className={cn(muted ? "text-slate-500" : "text-slate-600")}>
        {label}
      </span>
      <span
        className={cn(
          "font-medium tabular-nums",
          emphasize && "text-base font-semibold text-slate-900",
          negative && "text-emerald-600",
          !emphasize && !negative && "text-slate-800",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function OrderSummary({
  product,
  summary,
  paymentMethodId,
  sticky = true,
  className,
  footer,
}: OrderSummaryProps) {
  const method = getPaymentMethodById(paymentMethodId);

  return (
    <Card
      className={cn(
        "border-slate-200",
        sticky && "lg:sticky lg:top-24",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Order Summary</CardTitle>
        <p className="text-xs text-slate-500">
          {product.name} · {formatQuantityMt(summary.totalQuantityMt)}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <SummaryRow
          label="Rate"
          value={formatInrPerMt(summary.ratePerMt)}
          muted
        />
        <SummaryRow
          label="Base Amount"
          value={formatInr(summary.baseSubtotal, { compact: true })}
        />
        <SummaryRow
          label={summary.freightLabel}
          value={formatInr(summary.freight, { compact: true })}
        />
        <SummaryRow
          label="GST (18%)"
          value={formatInr(summary.gst, { compact: true })}
        />
        {summary.insuranceIncluded ? (
          <SummaryRow label="Insurance" value="Included" muted />
        ) : null}

        <Separator />

        <SummaryRow
          label="Subtotal"
          value={formatInr(summary.totalBeforePayment, { compact: true })}
        />

        {summary.discount > 0 ? (
          <SummaryRow
            label={`${method.title} Discount`}
            value={`−${formatInr(summary.discount, { compact: true })}`}
            negative
          />
        ) : null}

        {summary.interest > 0 ? (
          <SummaryRow
            label={`Credit Charges (${summary.interestRate}%)`}
            value={formatInr(summary.interest, { compact: true })}
          />
        ) : null}

        <Separator />

        <SummaryRow
          label="Grand Total"
          value={formatInr(summary.grandTotal, { compact: true })}
          emphasize
        />

        <p className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
          Payment method:{" "}
          <span className="font-medium text-slate-700">{method.title}</span>
          {" · "}
          Timing: {method.timing}
        </p>

        {footer}
      </CardContent>
    </Card>
  );
}
