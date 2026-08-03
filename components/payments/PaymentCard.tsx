"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import { PAYMENT_PROCESS_COPY, TRANSFER_BANK } from "@/mock/payments";
import type { CustomerOrder } from "@/types/order-journey";

interface PaymentCardProps {
  order: CustomerOrder;
  verified: boolean;
}

export function PaymentCard({ order, verified }: PaymentCardProps) {
  const copy = PAYMENT_PROCESS_COPY[order.paymentMethodId];

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{copy.title}</CardTitle>
          <Badge variant={verified ? "success" : "secondary"}>
            {verified ? "Verified" : copy.statusLabel}
          </Badge>
        </div>
        <p className="text-sm text-slate-500">{copy.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="grid gap-2 sm:grid-cols-2">
          {copy.highlights.map((item) => (
            <li
              key={item}
              className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 p-3">
            <p className="text-[11px] uppercase text-slate-500">Payable</p>
            <p className="mt-1 text-lg font-semibold">
              {formatInr(order.amount, { compact: true })}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 p-3">
            <p className="text-[11px] uppercase text-slate-500">Base Amount</p>
            <p className="mt-1 text-lg font-semibold">
              {formatInr(order.baseAmount, { compact: true })}
            </p>
          </div>
          {order.discount > 0 ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
              <p className="text-[11px] uppercase text-emerald-700">Discount</p>
              <p className="mt-1 font-semibold text-emerald-800">
                −{formatInr(order.discount, { compact: true })}
              </p>
            </div>
          ) : null}
          {order.interestAmount > 0 ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
              <p className="text-[11px] uppercase text-amber-700">
                Interest ({order.interestRate}%)
              </p>
              <p className="mt-1 font-semibold text-amber-800">
                {formatInr(order.interestAmount, { compact: true })}
              </p>
            </div>
          ) : null}
        </div>

        {order.paymentMethodId === "advance" ||
        order.paymentMethodId === "on_loading" ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <p className="font-semibold text-slate-900">Transfer Account</p>
            <dl className="mt-2 grid gap-1 text-slate-600 sm:grid-cols-2">
              <div>
                {TRANSFER_BANK.bankName} · {TRANSFER_BANK.branch}
              </div>
              <div>A/C {TRANSFER_BANK.accountNumber}</div>
              <div>IFSC {TRANSFER_BANK.ifsc}</div>
              <div>{TRANSFER_BANK.accountName}</div>
            </dl>
          </div>
        ) : null}

        {order.paymentMethodId === "credit_15" ||
        order.paymentMethodId === "credit_30" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] uppercase text-slate-500">
                Credit Limit
              </p>
              <p className="mt-1 font-semibold">
                {formatInr(order.creditLimit ?? 0, { compact: true })}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] uppercase text-slate-500">
                Available Balance
              </p>
              <p className="mt-1 font-semibold">
                {formatInr(order.availableCredit ?? 0, { compact: true })}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] uppercase text-slate-500">
                Credit Used
              </p>
              <p className="mt-1 font-semibold">
                {formatInr(order.creditUsed ?? order.amount, { compact: true })}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] uppercase text-slate-500">Due Date</p>
              <p className="mt-1 font-semibold">
                {order.dueDate ? formatDateDdMmYyyy(order.dueDate) : "—"}
              </p>
            </div>
          </div>
        ) : null}

        {order.paymentMethodId === "on_delivery" ? (
          <p className="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm text-blue-900">
            Payment will be collected after delivery confirmation and POD
            verification.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
