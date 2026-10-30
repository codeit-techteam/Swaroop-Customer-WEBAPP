"use client";

import { Clock3, MapPin, Truck, Warehouse } from "lucide-react";
import {
  deliveryEstimateCopy,
  dispatchWindowCopy,
  fulfilmentWarehouseCopy,
  type FulfilmentInfo,
} from "@/lib/fulfilment";
import { cn } from "@/lib/utils";

interface DeliveryCardProps {
  fulfilment: FulfilmentInfo | null;
  availabilityLabel?: string;
  destinationPincode?: string | null;
  onRequestPincode?: () => void;
  className?: string;
}

export function DeliveryCard({
  fulfilment,
  availabilityLabel,
  destinationPincode,
  onRequestPincode,
  className,
}: DeliveryCardProps) {
  const estimate = deliveryEstimateCopy({ fulfilment, destinationPincode });
  const warehouse = fulfilmentWarehouseCopy(fulfilment);
  const dispatch = dispatchWindowCopy(fulfilment);

  const rows = [
    { icon: Clock3, label: "Dispatch within", value: dispatch },
    { icon: Truck, label: "Estimated delivery", value: estimate.label },
    ...(warehouse
      ? [{ icon: Warehouse, label: "Fulfilment warehouse", value: warehouse }]
      : []),
    ...(availabilityLabel
      ? [{ icon: MapPin, label: "Availability", value: availabilityLabel }]
      : []),
  ];

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-slate-900">
        Delivery & fulfilment
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Dispatch is when material leaves the warehouse. Delivery is the
        estimated transit window.
      </p>
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
      {estimate.status === "need_pincode" && onRequestPincode ? (
        <button
          type="button"
          onClick={onRequestPincode}
          className="mt-3 inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Enter delivery pincode
        </button>
      ) : null}
    </section>
  );
}
