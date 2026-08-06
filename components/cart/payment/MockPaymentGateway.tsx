"use client";

import { useState } from "react";
import { CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MockPaymentGatewayProps {
  amount: number;
  paymentMethodLabel: string;
  onSuccess: () => void;
  onCancel?: () => void;
  className?: string;
  successMessage?: string;
  successSubtext?: string;
}

export function MockPaymentGateway({
  amount,
  paymentMethodLabel,
  onSuccess,
  onCancel,
  className,
  successMessage = "Payment Successful",
  successSubtext = "Waiting For Dispatch",
}: MockPaymentGatewayProps) {
  const [phase, setPhase] = useState<"ready" | "processing" | "success">(
    "ready",
  );

  function handlePay() {
    setPhase("processing");
    window.setTimeout(() => {
      setPhase("success");
      window.setTimeout(() => onSuccess(), 700);
    }, 1200);
  }

  if (phase === "success") {
    return (
      <Card
        className={cn(
          "border-emerald-200 bg-emerald-50/50 shadow-card",
          className,
        )}
      >
        <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-emerald-900">
              {successMessage}
            </p>
            <p className="mt-1 text-sm text-emerald-700">{successSubtext}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-slate-200 shadow-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4 text-brand" />
          Complete Payment
        </CardTitle>
        <p className="text-xs text-slate-500">
          Mock payment gateway · no real charge. Fulfilled by PetroTrade
          Network.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Amount</span>
            <span className="font-bold tabular-nums text-slate-900">
              {formatInr(amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Payment Method</span>
            <span className="font-medium text-slate-800">
              {paymentMethodLabel}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-[11px] text-slate-500">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          Secure mock settlement for demo. Seller identity remains hidden.
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl"
              disabled={phase === "processing"}
              onClick={onCancel}
            >
              Cancel
            </Button>
          ) : null}
          <Button
            type="button"
            className="h-11 flex-1 rounded-xl bg-brand hover:bg-brand-700"
            disabled={phase === "processing"}
            onClick={handlePay}
          >
            {phase === "processing" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              "Pay Now"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
