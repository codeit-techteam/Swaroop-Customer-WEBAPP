"use client";

import { BadgeCheck } from "lucide-react";
import type { QualityAssurance } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface QualityCardProps {
  quality: QualityAssurance;
  className?: string;
}

export function QualityCard({ quality, className }: QualityCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/80 p-4",
        className,
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-sm">
        <BadgeCheck className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 space-y-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {quality.title}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            {quality.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quality.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand shadow-sm"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
