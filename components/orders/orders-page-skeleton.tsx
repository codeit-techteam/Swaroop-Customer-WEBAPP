"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  SkeletonStatsCard,
  SkeletonTable,
} from "@/components/skeleton";

export function OrdersPageSkeleton() {
  return (
    <div
      className="space-y-5"
      aria-busy="true"
      aria-label="Loading orders"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3 sm:flex-row">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>

      <SkeletonTable rows={6} columns={6} />
    </div>
  );
}

export function OrdersListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading orders">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  );
}
