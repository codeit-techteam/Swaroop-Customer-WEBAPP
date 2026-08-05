"use client";

import {
  CheckCircle2,
  Package,
  PackageCheck,
  Truck,
  Warehouse,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  ShipmentDashboardSummary,
  ShipmentKpiFocus,
} from "@/types/shipment-tracking";

interface ShipmentKpiCardsProps {
  summary: ShipmentDashboardSummary;
  activeFocus?: ShipmentKpiFocus;
  onSelect?: (focus: ShipmentKpiFocus) => void;
  className?: string;
}

const CARDS: Array<{
  focus: Exclude<ShipmentKpiFocus, "none">;
  key: keyof ShipmentDashboardSummary;
  label: string;
  hint: string;
  icon: typeof Truck;
  tone: string;
}> = [
  {
    focus: "active",
    key: "activeShipments",
    label: "Active Shipments",
    hint: "Currently active",
    icon: Package,
    tone: "bg-brand/5 text-brand",
  },
  {
    focus: "ready_for_dispatch",
    key: "readyForDispatch",
    label: "Ready for Dispatch",
    hint: "Awaiting dispatch",
    icon: Warehouse,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    focus: "in_transit",
    key: "inTransit",
    label: "In Transit",
    hint: "On the way",
    icon: Truck,
    tone: "bg-sky-50 text-sky-700",
  },
  {
    focus: "out_for_delivery",
    key: "outForDelivery",
    label: "Out for Delivery",
    hint: "Final delivery stage",
    icon: PackageCheck,
    tone: "bg-violet-50 text-violet-700",
  },
  {
    focus: "delivered",
    key: "delivered",
    label: "Delivered",
    hint: "Completed",
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-700",
  },
];

export function ShipmentKpiCards({
  summary,
  activeFocus = "none",
  onSelect,
  className,
}: ShipmentKpiCardsProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        className,
      )}
    >
      {CARDS.map((card) => {
        const clickable = Boolean(onSelect);
        const active = activeFocus === card.focus;
        return (
          <Card
            key={card.key}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            aria-pressed={clickable ? active : undefined}
            onClick={
              clickable
                ? () => onSelect?.(active ? "none" : card.focus)
                : undefined
            }
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect?.(active ? "none" : card.focus);
                    }
                  }
                : undefined
            }
            className={cn(
              "border-slate-200 shadow-card transition-colors",
              clickable && "cursor-pointer hover:border-slate-300",
              active && "border-brand/40 ring-2 ring-brand/30",
            )}
          >
            <CardContent className="flex items-start gap-3 p-4">
              <div className={cn("rounded-xl p-2.5", card.tone)}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {summary[card.key]}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{card.hint}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
