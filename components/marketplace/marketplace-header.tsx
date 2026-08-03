"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarketplaceHeaderProps {
  title: string;
  resultCount?: number;
  actions?: ReactNode;
  className?: string;
}

export function MarketplaceHeader({
  title,
  resultCount,
  actions,
  className,
}: MarketplaceHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <h2 className="text-lg font-semibold text-slate-900">
        {title}
        {typeof resultCount === "number" ? (
          <span className="ml-1 font-medium text-slate-500">
            ({resultCount} {resultCount === 1 ? "grade" : "grades"} found)
          </span>
        ) : null}
      </h2>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
