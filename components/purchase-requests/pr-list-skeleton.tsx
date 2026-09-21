"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonTable } from "@/components/skeleton";

export function PrListSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label="Loading purchase requests"
    >
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3 sm:flex-row">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
      <SkeletonTable rows={6} columns={6} />
    </div>
  );
}
