"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Skeleton className="h-5 w-72" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <Skeleton className="h-24 rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <div className="space-y-3 border-t border-slate-200 p-4">
            <Skeleton className="h-6 rounded-md" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-11 rounded-xl" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
