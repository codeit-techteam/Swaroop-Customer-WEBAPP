"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DispatchDetails } from "@/types/order-journey";

interface DispatchInfoCardProps {
  dispatch: DispatchDetails;
}

export function DispatchInfoCard({ dispatch }: DispatchInfoCardProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Dispatch Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase text-slate-500">Vehicle</p>
          <p className="mt-1 font-mono text-sm font-semibold">
            {dispatch.vehicleNumber}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase text-slate-500">Driver</p>
          <p className="mt-1 text-sm font-semibold">{dispatch.driverName}</p>
          <p className="text-xs text-slate-500">
            {dispatch.driverContactMasked}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase text-slate-500">Warehouse</p>
          <p className="mt-1 text-sm font-semibold">{dispatch.warehouse}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase text-slate-500">Loading</p>
          <p className="mt-1 text-sm font-semibold">{dispatch.loadingStatus}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase text-slate-500">
            Expected Dispatch
          </p>
          <p className="mt-1 text-sm font-semibold">
            {dispatch.expectedDispatch}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase text-slate-500">
            Transport Partner
          </p>
          <p className="mt-1 text-sm font-semibold">
            {dispatch.transportPartner}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
          <p className="text-[11px] uppercase text-slate-500">
            Current Location
          </p>
          <p className="mt-1 text-sm font-semibold">
            {dispatch.currentLocation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
