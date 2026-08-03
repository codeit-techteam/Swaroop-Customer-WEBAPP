"use client";

import { MapPin, Truck } from "lucide-react";
import { formatInr } from "@/lib/format";
import type { LogisticsEstimate } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface LogisticsCardProps {
  logistics: LogisticsEstimate;
  className?: string;
}

export function LogisticsCard({ logistics, className }: LogisticsCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-slate-900">
        Logistics Estimate
      </h3>
      <div className="mt-3 space-y-3">
        <div className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Delivery Location
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {logistics.deliveryLocation}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Warehouse
            </p>
            <p className="font-semibold text-slate-800">
              {logistics.warehouse}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Est. Delivery
            </p>
            <p className="font-semibold text-slate-800">
              {logistics.estimatedDelivery}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Transport
            </p>
            <p className="font-semibold text-slate-800">
              {logistics.transportMode}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Freight
            </p>
            <p className="font-semibold text-slate-800">
              {formatInr(logistics.freightPerMt, { compact: true })} / MT
            </p>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Truck className="h-3.5 w-3.5" aria-hidden="true" />
          {logistics.freightLabel} calculated at quote stage
        </p>
      </div>
    </div>
  );
}
