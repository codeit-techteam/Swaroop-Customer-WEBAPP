"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductFeaturesProps {
  features: string[];
  className?: string;
}

export function ProductFeatures({ features, className }: ProductFeaturesProps) {
  if (features.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-slate-900">Product Features</h2>
      <ul className="mt-3 space-y-2">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-slate-700"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Check className="h-3 w-3" aria-hidden="true" />
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </section>
  );
}
