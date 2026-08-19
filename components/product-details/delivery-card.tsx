"use client";

import { Clock3, MapPin, Truck, Warehouse } from "lucide-react";
import type { LogisticsEstimate } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface DeliveryCardProps {
  origin: string;
  eta: string;
  logistics: LogisticsEstimate;
  className?: string;
}

export function DeliveryCard({
  origin,
  eta,
  logistics,
  className,
}: DeliveryCardProps) {
  const rows = [
    {
      icon: MapPin,
      label: "Origin",
      value: origin,
    },
    {
      icon: Clock3,
      label: "Dispatch",
      value: "24 Hours",
    },
    {
      icon: Truck,
      label: "Estimated Delivery",
      value: logistics.estimatedDelivery || eta,
    },
    {
      icon: Warehouse,
      label: "Warehouse",
      value: logistics.warehouse,
    },
  ];

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-slate-900">Delivery</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <Icon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                {row.label}
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {row.value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
