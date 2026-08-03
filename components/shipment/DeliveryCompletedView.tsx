"use client";

import { CheckCircle2, Download, RotateCcw, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import { DELIVERY_COPY } from "@/mock/shipments";
import type { CustomerOrder, DeliveryDetails } from "@/types/order-journey";

interface DeliveryCompletedViewProps {
  order: CustomerOrder;
  delivery: DeliveryDetails;
  onRepeatPurchase: () => void;
  onRateSeller: () => void;
}

export function DeliveryCompletedView({
  order,
  delivery,
  onRepeatPurchase,
  onRateSeller,
}: DeliveryCompletedViewProps) {
  return (
    <div className="space-y-4">
      <Card className="border-emerald-100 bg-emerald-50/50">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <CheckCircle2 className="h-14 w-14 text-emerald-600" />
          <div>
            <p className="text-xl font-semibold text-emerald-950">
              {DELIVERY_COPY.successTitle}
            </p>
            <p className="mt-2 max-w-md text-sm text-emerald-800/80">
              {DELIVERY_COPY.successSubtitle}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Delivery Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-slate-500">Receiver</p>
            <p className="font-medium">{delivery.receiverName}</p>
            <p className="text-xs text-slate-500">
              {delivery.receiverMobileMasked}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Delivered At</p>
            <p className="font-medium">
              {formatDateDdMmYyyy(delivery.deliveredAt)}
            </p>
          </div>
          <div>
            <p className="text-slate-500">POD ID</p>
            <p className="font-mono font-medium">{delivery.podId}</p>
          </div>
          <div>
            <p className="text-slate-500">Condition</p>
            <p className="font-medium">
              Good · {delivery.noDamageReported ? "No Damage" : "Reported"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Address</p>
            <p className="font-medium">{delivery.deliveryAddress}</p>
          </div>
          <div>
            <p className="text-slate-500">Invoice</p>
            <p className="font-mono font-medium">
              {order.invoiceNumber ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Amount</p>
            <p className="font-medium">
              {formatInr(order.amount, { compact: true })}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2 sm:grid-cols-3">
        <Button
          variant="outline"
          className="h-11 rounded-xl"
          onClick={() => toast.success("Invoice download queued (mock)")}
        >
          <Download className="h-4 w-4" />
          {DELIVERY_COPY.downloadInvoice}
        </Button>
        <Button
          variant="outline"
          className="h-11 rounded-xl"
          onClick={() => toast.success("Receipt download queued (mock)")}
        >
          <Download className="h-4 w-4" />
          {DELIVERY_COPY.downloadReceipt}
        </Button>
        <Button
          variant="outline"
          className="h-11 rounded-xl"
          onClick={() => toast.success("Documents download queued (mock)")}
        >
          <Download className="h-4 w-4" />
          {DELIVERY_COPY.downloadDocs}
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          className="h-11 flex-1 rounded-xl"
          onClick={onRateSeller}
        >
          <Star className="h-4 w-4" />
          {DELIVERY_COPY.rateLabel}
        </Button>
        <Button
          className="h-11 flex-1 rounded-xl bg-brand hover:bg-brand-700"
          onClick={onRepeatPurchase}
        >
          <RotateCcw className="h-4 w-4" />
          {DELIVERY_COPY.repeatLabel}
        </Button>
      </div>
    </div>
  );
}
