"use client";

import { materialsTaxonomy } from "@/mock/materials-taxonomy";
import { cn } from "@/lib/utils";

interface MaterialChipsProps {
  activeCode: string | null;
  onSelect: (code: string | null) => void;
  className?: string;
  /** Limit chips shown in the strip */
  limit?: number;
}

const PRIORITY_CODES = [
  "PP",
  "HDPE",
  "LDPE",
  "LLDPE",
  "PET",
  "PVC",
  "ABS",
  "PA",
  "MB",
  "ACE",
  "IPA",
  "SOL",
  "rPET",
  "rHDPE",
  "CMP",
  "BO",
];

export function MaterialChips({
  activeCode,
  onSelect,
  className,
  limit = 16,
}: MaterialChipsProps) {
  const prioritized = [
    ...PRIORITY_CODES.map((code) =>
      materialsTaxonomy.find((m) => m.code === code),
    ).filter(Boolean),
    ...materialsTaxonomy.filter((m) => !PRIORITY_CODES.includes(m.code)),
  ].slice(0, limit) as typeof materialsTaxonomy;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "rounded-lg px-3 py-1.5 text-sm font-medium transition",
          activeCode === null
            ? "bg-brand text-white shadow-sm"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200",
        )}
      >
        All Materials
      </button>
      {prioritized.map((material) => (
        <button
          key={material.id}
          type="button"
          onClick={() =>
            onSelect(activeCode === material.code ? null : material.code)
          }
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition",
            activeCode === material.code
              ? "bg-brand text-white shadow-sm"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
          )}
        >
          {material.code}
        </button>
      ))}
    </div>
  );
}
