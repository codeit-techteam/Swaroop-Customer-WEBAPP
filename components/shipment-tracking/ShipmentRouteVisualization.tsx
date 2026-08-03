"use client";

import { motion } from "framer-motion";
import { ArrowDown, MapPinned } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LiveProgressStep, RouteStop } from "@/types/shipment-tracking";

interface ShipmentRouteVisualizationProps {
  route: RouteStop[];
  remainingDistanceKm: number;
  etaLabel: string;
  className?: string;
}

export function ShipmentRouteVisualization({
  route,
  remainingDistanceKm,
  etaLabel,
  className,
}: ShipmentRouteVisualizationProps) {
  return (
    <Card className={cn("border-slate-200 shadow-card", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPinned className="h-4 w-4 text-brand" />
          Corridor Visualization
        </CardTitle>
        <p className="text-xs text-slate-500">
          Origin → transit stops → destination (visual timeline, not GPS map)
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col items-center gap-1 py-2">
          {route.map((stop, index) => {
            const isLast = index === route.length - 1;
            const done = stop.status === "completed";
            const current = stop.status === "current";
            return (
              <div
                key={`${stop.city}-${index}`}
                className="flex w-full flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.06 }}
                  className={cn(
                    "flex w-full max-w-sm items-center justify-between rounded-xl border px-4 py-3",
                    done && "border-emerald-200 bg-emerald-50/70",
                    current && "border-brand/40 bg-brand/[0.04] shadow-sm",
                    !done && !current && "border-slate-200 bg-white",
                  )}
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {index === 0
                        ? "Origin"
                        : isLast
                          ? "Destination"
                          : `Transit ${index}`}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {stop.city}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase",
                      done && "bg-emerald-100 text-emerald-700",
                      current && "bg-brand/10 text-brand",
                      !done && !current && "bg-slate-100 text-slate-500",
                    )}
                  >
                    {stop.status}
                  </span>
                </motion.div>
                {!isLast ? (
                  <ArrowDown
                    className={cn(
                      "my-1 h-4 w-4",
                      done ? "text-emerald-500" : "text-slate-300",
                    )}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Estimated Remaining Distance
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {remainingDistanceKm > 0
                ? `${remainingDistanceKm.toLocaleString("en-IN")} km`
                : "0 km"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Estimated Arrival
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {etaLabel}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LiveShipmentProgressProps {
  steps: LiveProgressStep[];
  className?: string;
}

export function LiveShipmentProgress({
  steps,
  className,
}: LiveShipmentProgressProps) {
  return (
    <Card className={cn("border-slate-200 shadow-card", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Live Shipment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-stretch gap-0">
          {steps.map((step, index) => {
            const done = step.status === "completed";
            const current = step.status === "current";
            const isLast = index === steps.length - 1;
            return (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <motion.span
                    layout
                    className={cn(
                      "flex h-3 w-3 rounded-full border-2",
                      done && "border-emerald-500 bg-emerald-500",
                      current && "border-brand bg-brand ring-4 ring-brand/20",
                      !done && !current && "border-slate-300 bg-white",
                    )}
                  />
                  {!isLast ? (
                    <span
                      className={cn(
                        "my-1 min-h-[20px] w-0.5 flex-1",
                        done ? "bg-emerald-400" : "bg-slate-200",
                      )}
                    />
                  ) : null}
                </div>
                <p
                  className={cn(
                    "pb-4 text-sm font-medium",
                    current && "text-brand",
                    done && "text-slate-700",
                    !done && !current && "text-slate-400",
                  )}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
