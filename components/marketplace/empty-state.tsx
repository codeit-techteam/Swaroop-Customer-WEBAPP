"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarketplaceEmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  action?: ReactNode;
  className?: string;
}

export function MarketplaceEmptyState({
  title = "No grades found",
  description = "No grades match your current filters. Try adjusting search or clearing filters.",
  onReset,
  action,
  className,
}: MarketplaceEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <PackageSearch className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {action}
        {onReset ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={onReset}
          >
            Clear Filters
          </Button>
        ) : null}
        {!action ? (
          <Button asChild className="rounded-xl bg-brand hover:bg-brand-700">
            <Link href={ROUTES.marketplace}>Browse Marketplace</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
