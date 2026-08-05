"use client";

import Link from "next/link";
import { PackageOpen, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

interface OfferEmptyStateProps {
  variant?: "no-results" | "no-active";
  onClearFilters?: () => void;
  className?: string;
}

export function OfferEmptyState({
  variant = "no-results",
  onClearFilters,
  className,
}: OfferEmptyStateProps) {
  const isNoResults = variant === "no-results";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
        {isNoResults ? (
          <SearchX className="h-7 w-7 text-slate-400" />
        ) : (
          <PackageOpen className="h-7 w-7 text-slate-400" />
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {isNoResults
          ? "No offers match your filters"
          : "No active offers are currently available"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {isNoResults
          ? "Try adjusting your filters or search terms to discover more deals."
          : "Check back soon or browse the full marketplace catalogue."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {isNoResults && onClearFilters ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        ) : null}
        <Button asChild className="rounded-xl bg-brand hover:bg-brand-700">
          <Link href={ROUTES.marketplace}>Browse All Products</Link>
        </Button>
      </div>
    </div>
  );
}
