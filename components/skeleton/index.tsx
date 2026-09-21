import type { HTMLAttributes } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function SkeletonText({
  lines = 1,
  className,
  ...props
}: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-4 rounded-lg",
            index === lines - 1 && lines > 1 ? "w-2/3" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({
  size = 40,
  className,
  ...props
}: SkeletonProps & { size?: number }) {
  return (
    <Skeleton
      className={cn("shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

export function SkeletonAvatar({
  size = 48,
  className,
  ...props
}: SkeletonProps & { size?: number }) {
  return <SkeletonCircle size={size} className={className} {...props} />;
}

export function SkeletonCard({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl border border-slate-100 bg-white p-4",
        className,
      )}
      {...props}
    >
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
  className,
  ...props
}: SkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-100 bg-white",
        className,
      )}
      {...props}
    >
      <div className="grid gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-20" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-3 px-4 py-3.5"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn("h-4", colIndex === 0 ? "w-24" : "w-full")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStatsCard({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl border border-slate-100 bg-white p-4",
        className,
      )}
      {...props}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function SkeletonBanner({
  className,
  ...props
}: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-[160px] w-full rounded-2xl sm:h-[200px]", className)}
      {...props}
    />
  );
}

export function SkeletonForm({
  fields = 4,
  className,
  ...props
}: SkeletonProps & { fields?: number }) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-2xl border border-slate-100 bg-white p-5",
        className,
      )}
      {...props}
    >
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
      <Skeleton className="mt-2 h-11 w-36 rounded-xl" />
    </div>
  );
}

export function SkeletonDetails({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Skeleton className="h-6 w-48" />
      <SkeletonText lines={3} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}

export function SkeletonTimeline({
  steps = 4,
  className,
  ...props
}: SkeletonProps & { steps?: number }) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: steps }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <SkeletonCircle size={28} />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full max-w-xs" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton };
