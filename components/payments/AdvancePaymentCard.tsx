"use client";

import {
  Building2,
  Calendar,
  Eye,
  FileText,
  IndianRupee,
  MapPin,
  Package,
  Warehouse,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PAYMENT_TYPE_LABELS,
  paymentsAdvancePayPath,
  paymentsDetailPath,
} from "@/constants/payments";
import { ROUTES } from "@/constants";
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import type { PaymentRecord } from "@/types/payments";
import { PaymentStatusChip } from "./PaymentStatusChip";

interface AdvancePaymentCardProps {
  payment: PaymentRecord;
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export function AdvancePaymentCard({ payment }: AdvancePaymentCardProps) {
  const router = useRouter();
  const canPay = [
    "pending",
    "pending_payment",
    "overdue",
    "rejected",
    "need_clarification",
    "failed",
  ].includes(payment.status);

  const canTrack = [
    "payment_submitted",
    "verification_pending",
    "processing",
    "verified",
    "paid",
  ].includes(payment.status);

  return (
    <Card className="border-slate-200 shadow-card transition hover:border-brand/30 hover:shadow-elevated">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900">
            {payment.orderNumber}
          </CardTitle>
          <p className="mt-0.5 text-xs text-slate-500">
            {payment.poNumber} · {payment.invoiceNumber}
          </p>
        </div>
        <PaymentStatusChip status={payment.status} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Meta
            icon={Package}
            label="Product"
            value={`${payment.product}${payment.productGrade ? ` · ${payment.productGrade}` : ""}`}
          />
          <Meta icon={Building2} label="Supply Source" value={payment.seller} />
          <Meta icon={Warehouse} label="Warehouse" value={payment.warehouse} />
          <Meta
            icon={MapPin}
            label="Quantity"
            value={formatQuantityMt(payment.quantityMt)}
          />
          <Meta
            icon={FileText}
            label="Payment Type"
            value={PAYMENT_TYPE_LABELS[payment.paymentType]}
          />
          <Meta
            icon={Calendar}
            label="Payment Due"
            value={formatDateDdMmYyyy(payment.dueDate)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-4">
          <div>
            <p className="text-[11px] text-slate-400">Amount</p>
            <p className="text-sm font-semibold">{formatInr(payment.amount)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">GST</p>
            <p className="text-sm font-semibold">{formatInr(payment.gst)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Freight + Ins.</p>
            <p className="text-sm font-semibold">
              {formatInr(payment.freight + payment.insurance)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Grand Total</p>
            <p className="text-sm font-semibold text-brand">
              {formatInr(payment.totalAmount)}
            </p>
          </div>
        </div>

        {payment.advancePercent != null ? (
          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
            <span>
              Advance: <strong>{payment.advancePercent}%</strong>
            </span>
            <span>
              Paid: <strong>{formatInr(payment.amountPaid)}</strong>
            </span>
            <span>
              Remaining: <strong>{formatInr(payment.remainingBalance)}</strong>
            </span>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-9 rounded-xl"
            onClick={() => router.push(paymentsDetailPath(payment.id))}
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          {canPay ? (
            <Button
              className="h-9 rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => router.push(paymentsAdvancePayPath(payment.id))}
            >
              <IndianRupee className="h-4 w-4" />
              Pay Now
            </Button>
          ) : null}
          {canTrack ? (
            <Button
              variant="secondary"
              className="h-9 rounded-xl"
              onClick={() =>
                router.push(`/payments/advance/${payment.id}/tracker`)
              }
            >
              Track Payment
            </Button>
          ) : null}
          <Button
            variant="ghost"
            className="h-9 rounded-xl"
            onClick={() => router.push(ROUTES.orders)}
          >
            View Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
