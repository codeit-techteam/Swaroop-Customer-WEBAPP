import type { NavBadgeVariant } from "@/types";
import { cn } from "@/lib/utils";

const BADGE_STYLES: Record<NavBadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  pending: "bg-sky-100 text-sky-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-slate-200 text-slate-500",
  processing: "bg-sky-100 text-sky-700",
  dispatched: "bg-orange-100 text-orange-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

interface NavBadgeProps {
  count: number;
  variant?: NavBadgeVariant;
  className?: string;
  compact?: boolean;
}

export function NavBadge({
  count,
  variant = "default",
  className,
  compact = false,
}: NavBadgeProps) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tabular-nums",
        compact
          ? "h-5 min-w-5 px-1 text-[10px]"
          : "h-5 min-w-5 px-1.5 text-[11px]",
        BADGE_STYLES[variant],
        className,
      )}
      aria-label={`${count} notifications`}
    >
      {label}
    </span>
  );
}
