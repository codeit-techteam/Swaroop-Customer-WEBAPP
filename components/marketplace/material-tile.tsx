"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MaterialTaxonomyItem } from "@/mock/materials-taxonomy";
import { formatInr } from "@/lib/format";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

interface MaterialTileProps {
  material: MaterialTaxonomyItem;
  className?: string;
  onSelect?: (code: string) => void;
}

export function MaterialTile({
  material,
  className,
  onSelect,
}: MaterialTileProps) {
  const href = `${ROUTES.marketplace}?search=${encodeURIComponent(material.code)}`;

  const content = (
    <div
      className={cn(
        "group flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-brand/30 hover:shadow-elevated",
        className,
      )}
    >
      <div>
        <p className="text-base font-bold tracking-tight text-slate-900">
          {material.code}
        </p>
        <p className="mt-1 text-xs text-slate-500">{material.name}</p>
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-xs font-medium text-slate-500">
          {material.gradeCount} Grades
        </p>
        <p className="text-sm font-semibold tabular-nums text-brand">
          From {formatInr(material.startingPrice)} / MT
        </p>
        <p className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-slate-600 group-hover:text-brand">
          View Grades
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </p>
      </div>
    </div>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className="h-full text-left"
        onClick={() => onSelect(material.code)}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className="h-full">
      {content}
    </Link>
  );
}
