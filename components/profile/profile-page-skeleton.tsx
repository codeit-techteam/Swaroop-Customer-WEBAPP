"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  SkeletonAvatar,
  SkeletonDetails,
} from "@/components/skeleton";

export function ProfilePageSkeleton() {
  return (
    <div
      className="mx-auto max-w-3xl space-y-5"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <div className="flex items-center gap-4">
          <SkeletonAvatar size={72} />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <SkeletonDetails />
      </div>
    </div>
  );
}
