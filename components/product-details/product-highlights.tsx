"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductHighlightsProps {
  highlights: string[];
  className?: string;
}

export function ProductHighlights({
  highlights,
  className,
}: ProductHighlightsProps) {
  if (highlights.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5",
        className,
      )}
      role="list"
      aria-label="Product highlights"
    >
      {highlights.map((item) => (
        <span
          key={item}
          role="listitem"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm"
        >
          <Check
            className="h-3.5 w-3.5 shrink-0 text-emerald-600"
            aria-hidden="true"
          />
          {item}
        </span>
      ))}
    </div>
  );
}
