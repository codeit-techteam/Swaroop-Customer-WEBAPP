"use client";

import { motion } from "framer-motion";
import {
  Box,
  CheckCircle2,
  MapPin,
  Navigation,
  Package,
  PackageCheck,
  Truck,
} from "lucide-react";
import { formatShipmentDateTime } from "@/lib/shipment-mvp";
import { cn } from "@/lib/utils";
import type {
  ShipmentTimelineStage,
  TimelineStageStatus,
} from "@/types/shipment-tracking";

const ICONS: Record<ShipmentTimelineStage["icon"], typeof CheckCircle2> = {
  check: CheckCircle2,
  package: Package,
  box: Box,
  truck: Truck,
  dispatch: Truck,
  transit: Navigation,
  pin: MapPin,
  delivered: PackageCheck,
};

function statusTone(status: TimelineStageStatus) {
  if (status === "completed")
    return {
      dot: "bg-emerald-500 border-emerald-500 text-white",
      line: "bg-emerald-400",
      title: "text-slate-900",
    };
  if (status === "current")
    return {
      dot: "bg-brand border-brand text-white ring-4 ring-brand/15",
      line: "bg-slate-200",
      title: "text-brand",
    };
  return {
    dot: "bg-white border-slate-300 text-slate-400",
    line: "bg-slate-200",
    title: "text-slate-400",
  };
}

interface ShipmentVerticalTimelineProps {
  stages: ShipmentTimelineStage[];
  className?: string;
  animate?: boolean;
}

export function ShipmentVerticalTimeline({
  stages,
  className,
  animate = true,
}: ShipmentVerticalTimelineProps) {
  return (
    <ol className={cn("relative space-y-0", className)}>
      {stages.map((stage, index) => {
        const Icon = ICONS[stage.icon];
        const tone = statusTone(stage.status);
        const isLast = index === stages.length - 1;
        const timeLabel = stage.timestamp
          ? formatShipmentDateTime(stage.timestamp)
          : stage.date && stage.time
            ? `${stage.date} · ${stage.time}`
            : stage.status === "current"
              ? "In progress"
              : "Pending";

        return (
          <motion.li
            key={stage.id}
            initial={animate ? { opacity: 0, x: -8 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {!isLast ? (
              <span
                className={cn(
                  "absolute left-[17px] top-10 h-[calc(100%-24px)] w-0.5",
                  stage.status === "completed" ? tone.line : "bg-slate-200",
                )}
              />
            ) : null}
            <div
              className={cn(
                "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2",
                tone.dot,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className={cn("text-sm font-semibold", tone.title)}>
                  {stage.title}
                </h4>
                <p className="text-xs text-slate-500">{timeLabel}</p>
              </div>
              <p className="mt-1 text-sm text-slate-600">{stage.description}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
