"use client";

import { Download, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { ORDER_CONFIRMATION_COPY } from "@/mock/purchase-request";
import type { SubmittedPurchaseRequest } from "@/types/purchase-request";
import { SuccessCard } from "./SuccessCard";

interface OrderGeneratedCardProps {
  request: SubmittedPurchaseRequest;
  onGoToOrder?: () => void;
  onDownloadPdf?: () => void;
}

export function OrderGeneratedCard({
  request,
  onGoToOrder,
  onDownloadPdf,
}: OrderGeneratedCardProps) {
  return (
    <div className="space-y-4">
      <SuccessCard
        title={ORDER_CONFIRMATION_COPY.approvedTitle}
        subtitle={ORDER_CONFIRMATION_COPY.approvedSubtitle}
        requestId={request.poNumber ?? request.orderId ?? request.displayId}
        chip="CONFIRMED"
      >
        <p className="text-sm text-slate-500">
          {ORDER_CONFIRMATION_COPY.poConfirmed}
        </p>
      </SuccessCard>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <PackageCheck className="h-4 w-4 text-brand" aria-hidden />
            Order Generated
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                Order Number
              </dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-slate-900">
                {request.orderId}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                Purchase Order
              </dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-slate-900">
                {request.poNumber}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                Expected Dispatch
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {request.expectedDispatch}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                Payment Type
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {request.paymentMethodTitle}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                Warehouse
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {request.product.warehouse}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                Quantity
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {formatQuantityMt(request.form.quantityMt)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <p className="text-xs text-slate-500">Grand Total</p>
              <p className="text-lg font-semibold text-slate-900">
                {formatInr(request.summary.grandTotal, { compact: true })}
              </p>
            </div>
            <Badge variant="success">Order Confirmed</Badge>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="h-11 flex-1 rounded-xl bg-brand hover:bg-brand-700"
              onClick={onGoToOrder}
            >
              View Order
            </Button>
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-xl"
              onClick={onDownloadPdf}
            >
              <Download className="h-4 w-4" />
              Download Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
