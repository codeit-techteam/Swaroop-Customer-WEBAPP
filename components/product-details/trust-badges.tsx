"use client";

import {
  BadgeCheck,
  FileCheck2,
  Lock,
  Receipt,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TRUST_ITEMS = [
  { label: "PetroTrade Verified", icon: BadgeCheck },
  { label: "GST Invoice", icon: Receipt },
  { label: "Quality Checked", icon: FileCheck2 },
  { label: "Secure Payment", icon: Lock },
  { label: "Logistics Support", icon: Truck },
] as const;

interface TrustBadgesProps {
  className?: string;
}

export function TrustBadges({ className }: TrustBadgesProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-card",
        className,
      )}
    >
      {TRUST_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-xl bg-slate-50/80 px-2.5 py-2"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
            <span className="text-[11px] font-semibold leading-tight text-slate-700">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
