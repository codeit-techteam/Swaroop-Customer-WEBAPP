import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  meta?: string;
  className?: string;
}

export function SectionTitle({
  title,
  icon,
  actionLabel,
  actionHref,
  meta,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {icon ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">
            {icon}
          </span>
        ) : null}
        <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
          {title}
        </h2>
        {meta ? (
          <span className="truncate text-xs text-slate-400 sm:ml-1">
            {meta}
          </span>
        ) : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="text-sm font-medium text-accent-blue transition-colors hover:text-accent-blue-600"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
