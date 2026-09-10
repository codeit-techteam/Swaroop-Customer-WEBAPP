"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailsPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-72" />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
