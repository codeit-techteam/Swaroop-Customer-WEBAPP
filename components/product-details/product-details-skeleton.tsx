"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailsPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-72" />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,0.3fr)_minmax(0,0.45fr)_minmax(260px,0.25fr)]">
        <div className="space-y-6">
          <Skeleton className="aspect-square rounded-2xl sm:aspect-[5/4]" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-16 shrink-0 rounded-xl" />
            ))}
          </div>
          <Skeleton className="hidden h-40 rounded-2xl xl:block" />
          <Skeleton className="hidden h-36 rounded-2xl xl:block" />
        </div>
        <div className="space-y-6 lg:col-start-1 lg:row-start-2 xl:col-start-2 xl:row-start-1">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
        </div>
        <div className="space-y-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 xl:col-start-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
