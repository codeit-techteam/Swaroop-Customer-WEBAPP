"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, FileText, Package, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { formatDateDdMmYyyy, formatInr, formatQuantityMt } from "@/lib/format";
import {
  getAdaptiveTimeline,
  getCheckoutPaymentOption,
  getCreditTermLabel,
  getTimelineCurrentIndex,
} from "@/mock/checkout-payment";
import { useCheckoutStore } from "@/store/checkoutStore";
import { cn } from "@/lib/utils";
import {
  MockPaymentGateway,
  OrderTimeline,
  PaymentStatusBadge,
} from "./payment";
import type { CheckoutPaymentMethodId } from "@/types/checkout-payment";

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PurchaseOrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poParam = searchParams.get("po");
  const activePurchaseOrder = useCheckoutStore((s) => s.activePurchaseOrder);
  const sellerApproved = useCheckoutStore((s) => s.sellerApproved);
  const tickSellerApproval = useCheckoutStore((s) => s.tickSellerApproval);
  const markSellerApproved = useCheckoutStore((s) => s.markSellerApproved);
  const completeMockPayment = useCheckoutStore((s) => s.completeMockPayment);

  const po =
    activePurchaseOrder &&
    (!poParam || activePurchaseOrder.poNumber === poParam)
      ? activePurchaseOrder
      : activePurchaseOrder;

  const [now, setNow] = useState(() => Date.now());
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
      tickSellerApproval();
    }, 1000);
    return () => window.clearInterval(id);
  }, [tickSellerApproval]);

  const remainingMs = po
    ? Math.max(0, new Date(po.confirmationEndsAt).getTime() - now)
    : 0;
  const timerEnded = Boolean(po && remainingMs <= 0);

  useEffect(() => {
    if (timerEnded && !sellerApproved) {
      markSellerApproved();
    }
  }, [timerEnded, sellerApproved, markSellerApproved]);

  const methodId: CheckoutPaymentMethodId = po?.paymentMethodId ?? "advance";
  const timelineSteps = useMemo(
    () => getAdaptiveTimeline(methodId),
    [methodId],
  );
  const paymentCompleted = Boolean(po?.paymentCompletedAt);
  const hasProforma = Boolean(po?.proformaInvoiceNumber);
  const approved = sellerApproved || timerEnded;

  const timelineCurrent = useMemo(() => {
    if (!po) return 0;
    if (
      paymentCompleted &&
      (methodId === "advance" || methodId === "on_loading")
    ) {
      // Advance paid → Waiting for dispatch / invoice step
      return getTimelineCurrentIndex({
        methodId,
        sellerApproved: true,
        hasProforma: true,
        paymentCompleted: true,
      });
    }
    return getTimelineCurrentIndex({
      methodId,
      sellerApproved: approved,
      hasProforma: approved && hasProforma,
      paymentCompleted,
    });
  }, [po, methodId, approved, hasProforma, paymentCompleted]);

  const needsOnlinePayment =
    methodId === "advance" || methodId === "on_loading";

  if (!po) {
    return (
      <PageContainer>
        <PageHeader
          title="Purchase Order"
          description="No active purchase order found."
          breadcrumbs={[{ label: "Purchase Order" }]}
        />
        <Button
          className="rounded-xl bg-brand hover:bg-brand-700"
          onClick={() => router.push(ROUTES.marketplace)}
        >
          Back to Marketplace
        </Button>
      </PageContainer>
    );
  }

  const paymentOption = getCheckoutPaymentOption(methodId);

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Order Generated"
        description="Your order is awaiting seller confirmation under the PetroTrade network."
        breadcrumbs={[
          { label: "Checkout", href: ROUTES.checkout },
          { label: "Purchase Order" },
        ]}
      />

      <Card className="mb-4 border-emerald-200 bg-emerald-50/40 shadow-card">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-slate-900">
              Purchase Order Successfully Generated
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-brand">
              {po.poNumber}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="warning" className="rounded-full">
                {approved ? "Seller Approved" : "Waiting For Seller Approval"}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {po.paymentMethodTitle ?? paymentOption.title}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                Created {formatDateDdMmYyyy(po.createdAt)}
              </Badge>
              {po.paymentStatus ? (
                <PaymentStatusBadge status={po.paymentStatus} />
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock3 className="h-4 w-4 text-brand" />
                Seller Confirmation Window
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approved ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <p className="font-semibold text-emerald-800">
                      Order Approved
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">
                      Proforma Invoice Generated
                    </p>
                    {po.proformaInvoiceNumber ? (
                      <p className="mt-2 font-mono text-sm font-semibold text-brand">
                        {po.proformaInvoiceNumber}
                      </p>
                    ) : null}
                  </div>

                  {showPaymentGateway &&
                  needsOnlinePayment &&
                  !paymentCompleted ? (
                    <MockPaymentGateway
                      amount={po.grandTotal}
                      paymentMethodLabel={
                        po.paymentMethodTitle ?? paymentOption.title
                      }
                      successSubtext={
                        methodId === "on_loading"
                          ? "Goods Ready For Loading"
                          : "Waiting For Dispatch"
                      }
                      onSuccess={() => {
                        completeMockPayment();
                        setShowPaymentGateway(false);
                        toast.success("Payment Successful");
                      }}
                      onCancel={() => setShowPaymentGateway(false)}
                    />
                  ) : (
                    <PostApprovalPanel
                      methodId={methodId}
                      paymentCompleted={paymentCompleted}
                      amount={po.grandTotal}
                      creditTermDays={po.creditTermDays}
                      creditDueDate={po.creditDueDate}
                      onProceedPayment={() => setShowPaymentGateway(true)}
                      onViewProforma={() =>
                        router.push(ROUTES.documentsProforma)
                      }
                    />
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-4xl font-bold tabular-nums tracking-tight text-brand">
                    {formatCountdown(remainingMs)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Waiting For Seller Approval · 15 minute confirmation window
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Payment method (
                    {po.paymentMethodTitle ?? paymentOption.title}) shared with
                    PetroTrade for approval review.
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-xs text-slate-500 underline-offset-2 hover:underline"
                    onClick={() => markSellerApproved()}
                  >
                    Simulate seller approval (demo)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Order Timeline</CardTitle>
              <p className="text-xs text-slate-500">
                Steps adapt to your selected payment method.
              </p>
            </CardHeader>
            <CardContent>
              <OrderTimeline
                steps={timelineSteps}
                currentIndex={timelineCurrent}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row
                label="Payment Method"
                value={po.paymentMethodTitle ?? paymentOption.title}
              />
              <Row
                label="Payment Timing"
                value={po.paymentTiming ?? paymentOption.timing}
              />
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Payment Status</span>
                <PaymentStatusBadge
                  status={po.paymentStatus ?? "pending_seller_approval"}
                />
              </div>
              {methodId === "credit" && po.creditTermDays ? (
                <>
                  <Row
                    label="Credit Terms"
                    value={getCreditTermLabel(po.creditTermDays)}
                  />
                  {po.creditDueDate ? (
                    <Row
                      label="Due Date"
                      value={formatDateDdMmYyyy(po.creditDueDate)}
                    />
                  ) : null}
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Order Lines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {po.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatQuantityMt(item.quantityMt)} · Fulfilled by
                      PetroTrade Network
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums">
                    {formatInr(item.unitPrice * item.quantityMt, {
                      compact: true,
                    })}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">PO Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="PO Number" value={po.poNumber} mono />
              {po.proformaInvoiceNumber ? (
                <Row
                  label="Proforma Invoice"
                  value={po.proformaInvoiceNumber}
                  mono
                />
              ) : null}
              <Row
                label="Payment"
                value={po.paymentMethodTitle ?? paymentOption.title}
              />
              <Row label="Subtotal" value={formatInr(po.subtotal)} />
              <Row label="GST" value={formatInr(po.gst)} />
              <Row
                label="Estimated Freight"
                value={formatInr(po.estimatedFreight)}
              />
              <Row label="Insurance" value={po.insuranceLabel} />
              <div className="border-t border-slate-100 pt-2">
                <Row
                  label="Grand Total"
                  value={formatInr(po.grandTotal)}
                  bold
                />
              </div>
              <p className="pt-1 text-[11px] text-slate-400">
                Fulfilled by PetroTrade Network
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              className="h-11 rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => router.push(ROUTES.purchaseRequests)}
            >
              <FileText className="h-4 w-4" />
              View Purchase Order
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => router.push(ROUTES.marketplace)}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function PostApprovalPanel({
  methodId,
  paymentCompleted,
  amount,
  creditTermDays,
  creditDueDate,
  onProceedPayment,
  onViewProforma,
}: {
  methodId: CheckoutPaymentMethodId;
  paymentCompleted: boolean;
  amount: number;
  creditTermDays?: 15 | 30 | 45;
  creditDueDate?: string;
  onProceedPayment: () => void;
  onViewProforma: () => void;
}) {
  if (methodId === "advance" || methodId === "on_loading") {
    if (paymentCompleted) {
      return (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="font-semibold text-emerald-800">Payment Successful</p>
          <p className="mt-1 text-sm text-emerald-700">
            {methodId === "on_loading"
              ? "Goods Ready For Loading"
              : "Waiting For Dispatch"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {methodId === "on_loading" ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <p className="flex items-center gap-2 font-semibold text-amber-900">
              <Package className="h-4 w-4" />
              Loading scheduled
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Payment required before loading.
            </p>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-xl"
            onClick={onViewProforma}
          >
            <FileText className="h-4 w-4" />
            View Proforma Invoice
          </Button>
          <Button
            className="h-11 flex-1 rounded-xl bg-brand hover:bg-brand-700"
            onClick={onProceedPayment}
          >
            <Wallet className="h-4 w-4" />
            {methodId === "on_loading"
              ? "Complete Payment"
              : "Proceed To Payment"}
          </Button>
        </div>
      </div>
    );
  }

  if (methodId === "on_delivery") {
    return (
      <div className="space-y-3">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Payment</span>
            <span className="font-medium text-slate-800">Cash On Delivery</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Amount Due</span>
            <span className="font-bold tabular-nums text-slate-900">
              {formatInr(amount)}
            </span>
          </div>
          <p className="pt-1 text-xs text-slate-500">
            Payment Pending · Pay At Delivery. No online payment required.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-11 w-full rounded-xl"
          onClick={onViewProforma}
        >
          <FileText className="h-4 w-4" />
          View Proforma Invoice
        </Button>
      </div>
    );
  }

  // credit
  return (
    <div className="space-y-3">
      <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <p className="font-semibold text-emerald-800">
          Credit Purchase · Approved
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-emerald-700">Terms</span>
          <span className="font-medium text-emerald-900">
            {creditTermDays ? getCreditTermLabel(creditTermDays) : "Net Credit"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-emerald-700">Credit Used</span>
          <span className="font-bold tabular-nums text-emerald-900">
            {formatInr(amount)}
          </span>
        </div>
        {creditDueDate ? (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-700">Due Date</span>
            <span className="font-medium text-emerald-900">
              {formatDateDdMmYyyy(creditDueDate)}
            </span>
          </div>
        ) : null}
        <p className="pt-1 text-xs text-emerald-700">
          Invoice generated · Due After {creditTermDays ?? 30} Days. No payment
          page required.
        </p>
      </div>
      <Button
        variant="outline"
        className="h-11 w-full rounded-xl"
        onClick={onViewProforma}
      >
        <FileText className="h-4 w-4" />
        View Proforma Invoice
      </Button>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span
        className={cn(
          "tabular-nums text-slate-900",
          mono && "font-mono",
          bold ? "font-bold" : "font-medium",
        )}
      >
        {value}
      </span>
    </div>
  );
}
