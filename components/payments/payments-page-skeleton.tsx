"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  SkeletonStatsCard,
  SkeletonTable,
} from "@/components/skeleton";

export function PaymentsPageSkeleton() {
  return (
    <div
      className="space-y-5"
      aria-busy="true"
      aria-label="Loading payments"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-32 rounded-xl" />
        ))}
      </div>

      <SkeletonTable rows={5} columns={5} />
    </div>
  );
}
