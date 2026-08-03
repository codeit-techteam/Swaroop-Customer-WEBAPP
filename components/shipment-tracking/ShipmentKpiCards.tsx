"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Package,
  Truck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ShipmentDashboardSummary } from "@/types/shipment-tracking";

interface ShipmentKpiCardsProps {
  summary: ShipmentDashboardSummary;
  className?: string;
}

const CARDS: Array<{
  key: keyof ShipmentDashboardSummary;
  label: string;
  hint: string;
  icon: typeof Truck;
  tone: string;
}> = [
  {
    key: "activeShipments",
    label: "Active Shipments",
    hint: "Not yet delivered",
    icon: Package,
    tone: "bg-brand/5 text-brand",
  },
  {
    key: "inTransit",
    label: "In Transit",
    hint: "On corridor",
    icon: Truck,
    tone: "bg-sky-50 text-sky-700",
  },
  {
    key: "expectedToday",
    label: "Expected Today",
    hint: "ETA today",
    icon: Clock3,
    tone: "bg-indigo-50 text-indigo-700",
  },
  {
    key: "deliveredThisWeek",
    label: "Delivered This Week",
    hint: "Completed",
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "delayedShipments",
    label: "Delayed Shipments",
    hint: "Needs attention",
    icon: AlertTriangle,
    tone: "bg-rose-50 text-rose-700",
  },
];

export function ShipmentKpiCards({
  summary,
  className,
}: ShipmentKpiCardsProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-5", className)}>
      {CARDS.map((card) => (
        <Card key={card.key} className="border-slate-200 shadow-card">
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
      ))}
    </div>
  );
}
