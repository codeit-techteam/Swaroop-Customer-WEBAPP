"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  SkeletonForm,
  SkeletonStatsCard,
  SkeletonTimeline,
} from "@/components/skeleton";

export function CreditPageSkeleton() {
  return (
    <div
      className="space-y-5"
      aria-busy="true"
      aria-label="Loading credit"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SkeletonStatsCard />
        <SkeletonStatsCard />
        <SkeletonStatsCard />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <SkeletonForm fields={5} />
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5">
          <Skeleton className="h-5 w-32" />
          <SkeletonTimeline steps={4} />
        </div>
      </div>
    </div>
  );
}
