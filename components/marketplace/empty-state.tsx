"use client";

import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarketplaceEmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  className?: string;
}

export function MarketplaceEmptyState({
  title = "No materials found",
  description = "Try adjusting your search or filters to find matching grades.",
  onReset,
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
        {onReset ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={onReset}
          >
            Reset Filters
          </Button>
        ) : null}
        <Button asChild className="rounded-xl bg-brand hover:bg-brand-700">
          <Link href={ROUTES.marketplace}>Browse Marketplace</Link>
        </Button>
      </div>
    </div>
  );
}
