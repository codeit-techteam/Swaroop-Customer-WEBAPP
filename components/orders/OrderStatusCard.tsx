"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { statusLabel } from "@/lib/order-journey-navigation";
import type { CustomerOrder } from "@/types/order-journey";

interface OrderStatusCardProps {
  order: CustomerOrder;
}

export function OrderStatusCard({ order }: OrderStatusCardProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Order Status</CardTitle>
          <Badge variant="secondary">{statusLabel(order.orderStatus)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase text-slate-500">Order Number</p>
          <p className="mt-1 font-mono text-sm font-semibold">{order.id}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase text-slate-500">PO Number</p>
          <p className="mt-1 font-mono text-sm font-semibold">
            {order.poNumber}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase text-slate-500">Product</p>
          <p className="mt-1 text-sm font-semibold">
            {order.productName} · {order.grade}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase text-slate-500">Quantity</p>
          <p className="mt-1 text-sm font-semibold">
            {formatQuantityMt(order.quantityMt)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase text-slate-500">Warehouse</p>
          <p className="mt-1 text-sm font-semibold">{order.warehouse}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase text-slate-500">Payment</p>
          <p className="mt-1 text-sm font-semibold">
            {order.paymentMethodTitle} · {order.paymentStatus}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
          <p className="text-[11px] uppercase text-slate-500">Amount Payable</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatInr(order.amount, { compact: true })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
