"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { shipmentStatusTimelineIndex } from "@/lib/shipment-mvp";
import {
  MVP_SHIPMENT_TIMELINE,
  type ShipmentStatus,
} from "@/types/shipment-tracking";

interface ShipmentProgressTrackerProps {
  status: ShipmentStatus;
  /** Compact horizontal for list cards; vertical for details. */
  variant?: "horizontal" | "vertical";
  className?: string;
}

export function ShipmentProgressTracker({
  status,
  variant = "horizontal",
  className,
}: ShipmentProgressTrackerProps) {
  const currentIndex = shipmentStatusTimelineIndex(status);

  if (variant === "vertical") {
    return (
      <ol className={cn("space-y-0", className)}>
        {MVP_SHIPMENT_TIMELINE.map((stage, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;
          const pending = index > currentIndex;
          const isLast = index === MVP_SHIPMENT_TIMELINE.length - 1;

          return (
            <li key={stage.id} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast ? (
                <span
                  className={cn(
                    "absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5",
                    done ? "bg-emerald-400" : "bg-slate-200",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px]",
                  done && "border-emerald-500 bg-emerald-500 text-white",
                  current &&
                    "border-brand bg-brand text-white ring-4 ring-brand/15",
                  pending && "border-slate-300 bg-white text-slate-400",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : current ? "●" : "○"}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    current && "text-brand",
                    done && "text-slate-800",
                    pending && "text-slate-400",
                  )}
                >
                  {stage.title}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center gap-0">
        {MVP_SHIPMENT_TIMELINE.map((stage, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;
          const pending = index > currentIndex;

          return (
            <div key={stage.id} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                    done && "bg-brand text-white",
                    current &&
                      "bg-brand text-white ring-2 ring-brand/25 ring-offset-1",
                    pending &&
                      "border border-slate-200 bg-white text-slate-400",
                  )}
                  title={stage.title}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "hidden w-full truncate text-center text-[9px] font-medium leading-tight sm:block",
                    current ? "text-brand" : "text-slate-500",
                  )}
                >
                  {stage.title}
                </span>
              </div>
              {index < MVP_SHIPMENT_TIMELINE.length - 1 ? (
                <div
                  className={cn(
                    "mb-0 h-0.5 min-w-[4px] flex-1 rounded-full sm:mb-4",
                    index < currentIndex ? "bg-brand" : "bg-slate-200",
                  )}
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs font-medium text-slate-600 sm:hidden">
        {MVP_SHIPMENT_TIMELINE[currentIndex]?.title}
      </p>
    </div>
  );
}
