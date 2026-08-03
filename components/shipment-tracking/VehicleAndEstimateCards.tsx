"use client";

import type { ReactNode } from "react";
import {
  CloudSun,
  Gauge,
  Navigation,
  Phone,
  Satellite,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Field
          label="GPS Enabled"
          value={shipment.gpsEnabled ? "Yes" : "No"}
          icon={
            <Satellite
              className={cn(
                "h-3.5 w-3.5",
                shipment.gpsEnabled ? "text-emerald-600" : "text-slate-400",
              )}
            />
          }
        />
        <Field label="Driver" value={shipment.driverName} />
        <Field
          label="Mobile"
          value={shipment.driverMobile}
          icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
        />
        <Field
          label="License"
          value={shipment.driverLicense}
          icon={<ShieldCheck className="h-3.5 w-3.5 text-slate-400" />}
        />
        <Field label="Transport Company" value={shipment.transportCompany} />
      </CardContent>
    </Card>
  );
}

interface DeliveryEstimateCardProps {
  shipment: ShipmentRecord;
  etaLabel: string;
  className?: string;
}

const TRAFFIC_LABEL = {
  clear: { label: "Clear", className: "bg-emerald-50 text-emerald-700" },
  moderate: { label: "Moderate", className: "bg-amber-50 text-amber-700" },
  heavy: { label: "Heavy", className: "bg-rose-50 text-rose-700" },
} as const;

export function DeliveryEstimateCard({
  shipment,
  etaLabel,
  className,
}: DeliveryEstimateCardProps) {
  const traffic = TRAFFIC_LABEL[shipment.trafficIndicator];

  return (
    <Card
      className={cn(
        "overflow-hidden border-slate-200 bg-gradient-to-br from-brand via-brand-700 to-slate-900 text-white shadow-elevated",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-white/90">
          Delivery Estimate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60">
            Estimated Delivery
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {etaLabel}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-[11px] uppercase tracking-wide text-white/60">
              Remaining Hours
            </p>
            <p className="mt-1 flex items-center gap-2 text-xl font-semibold">
              <Gauge className="h-5 w-5 text-sky-200" />
              {shipment.remainingHours}h
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-[11px] uppercase tracking-wide text-white/60">
              Current City
            </p>
            <p className="mt-1 flex items-center gap-2 text-xl font-semibold">
              <Navigation className="h-5 w-5 text-sky-200" />
              {shipment.currentCity}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-[11px] uppercase tracking-wide text-white/60">
              Destination
            </p>
            <p className="mt-1 text-lg font-semibold">{shipment.destination}</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-[11px] uppercase tracking-wide text-white/60">
              Weather
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium">
              <CloudSun className="h-4 w-4 text-sky-200" />
              {shipment.weatherStatus}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
          <span className="text-sm text-white/80">Traffic Indicator</span>
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold",
              traffic.className,
            )}
          >
            {traffic.label}
          </span>
        </div>
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
