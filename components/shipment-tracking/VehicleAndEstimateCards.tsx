"use client";

import type { ReactNode } from "react";
import { ShieldCheck, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatShipmentDate } from "@/lib/shipment-mvp";
import { cn } from "@/lib/utils";
import type { ShipmentRecord } from "@/types/shipment-tracking";

interface VehicleDetailsCardProps {
  shipment: ShipmentRecord;
  className?: string;
}

export function VehicleDetailsCard({
  shipment,
  className,
}: VehicleDetailsCardProps) {
  return (
    <Card className={cn("border-slate-200 shadow-card", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="h-4 w-4 text-brand" />
          Vehicle Details
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Field label="Vehicle Number" value={shipment.vehicleNumber} mono />
        <Field label="Truck Type" value={shipment.vehicleType} />
        <Field label="Capacity" value={`${shipment.truckCapacityMt} MT`} />
        <Field label="Driver" value={shipment.driverName} />
        <Field
          label="License"
          value={shipment.driverLicense}
          icon={<ShieldCheck className="h-3.5 w-3.5 text-slate-400" />}
        />
        <Field
          label="Expected Delivery"
          value={formatShipmentDate(
            shipment.expectedDeliveryDate ?? shipment.eta,
          )}
        />
      </CardContent>
    </Card>
  );
}

/** @deprecated Live ETA card removed for MVP — kept as thin alias. */
export function DeliveryEstimateCard({
  shipment,
  etaLabel,
  className,
}: {
  shipment: ShipmentRecord;
  etaLabel?: string;
  className?: string;
}) {
  return (
    <Card className={cn("border-slate-200 shadow-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Expected Delivery</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-slate-900">
          {etaLabel ??
            formatShipmentDate(shipment.expectedDeliveryDate ?? shipment.eta)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Display date from shipment record — not calculated live
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Destination: {shipment.destination}
        </p>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800",
          mono && "font-mono",
        )}
      >
        {icon}
        {value}
      </p>
    </div>
  );
}
