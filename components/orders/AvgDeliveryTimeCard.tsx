"use client";

import { Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DELIVERY_TIME_KPI } from "@/constants/order-progress";
import { cn } from "@/lib/utils";

export function AvgDeliveryTimeCard() {
  const { avgDays, slaDays, onTimePercent, delayedPercent, windowLabel } =
    DELIVERY_TIME_KPI;
  const vsSla = Math.round((slaDays - avgDays) * 10) / 10;
  const fasterThanSla = vsSla > 0;
  const fillPercent = Math.min(100, Math.round((avgDays / slaDays) * 100));

  return (
    <Card className="border-slate-200 shadow-card">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-brand/5 p-2.5 text-brand">
            <Truck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Avg Delivery Time
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-xl font-semibold text-slate-900">
                {avgDays} days
              </p>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                  fasterThanSla
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-800",
                )}
              >
                {fasterThanSla
                  ? `${vsSla}d under SLA`
                  : `${Math.abs(vsSla)}d over SLA`}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{windowLabel}</p>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Vs {slaDays}-day SLA</span>
            <span className="font-medium text-slate-700">
              {avgDays}/{slaDays} days
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-brand"
              style={{ width: `${fillPercent}%` }}
            />
            <div
              className="absolute inset-y-0 w-0.5 bg-slate-400"
              style={{ left: "100%", marginLeft: "-2px" }}
              title={`${slaDays}-day SLA`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-emerald-50 px-2.5 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">
              On time
            </p>
            <p className="text-sm font-semibold text-emerald-900">
              {onTimePercent}%
            </p>
          </div>
          <div className="rounded-lg bg-amber-50 px-2.5 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-amber-800">
              Delayed
            </p>
            <p className="text-sm font-semibold text-amber-950">
              {delayedPercent}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
