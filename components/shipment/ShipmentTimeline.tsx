"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShipmentTimelineStep } from "@/types/order-journey";

interface ShipmentTimelineProps {
  steps: ShipmentTimelineStep[];
}

export function ShipmentTimeline({ steps }: ShipmentTimelineProps) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const done = step.status === "completed";
        const current = step.status === "current";
        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                  done && "bg-brand text-white",
                  current &&
                    "bg-accent-blue text-white ring-4 ring-accent-blue/15",
                  !done && !current && "bg-slate-100 text-slate-500",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span
                  className={cn(
                    "my-1 min-h-8 w-0.5 flex-1",
                    done ? "bg-brand" : "bg-slate-200",
                  )}
                />
              ) : null}
            </div>
            <div className="pb-6 pt-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  current ? "text-brand" : "text-slate-800",
                )}
              >
                {step.title}
              </p>
              {step.timestamp ? (
                <p className="text-xs text-slate-500">
                  {new Date(step.timestamp).toLocaleString("en-IN")}
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  {current ? "In progress" : done ? "Completed" : "Pending"}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
