export type StatusTone =
  "default" | "success" | "warning" | "danger" | "info" | "neutral";

const STATUS_COLOR_MAP: Record<string, StatusTone> = {
  pending: "warning",
  pending_seller_approval: "warning",
  pending_approval: "warning",
  seller_reviewing: "warning",
  review_pending: "warning",
  payment_pending: "warning",
  submitted: "info",
  processing: "info",
  confirmed: "info",
  shipped: "info",
  in_transit: "info",
  ready_for_dispatch: "info",
  delivered: "success",
  completed: "success",
  paid: "success",
  success: "success",
  active: "success",
  approved: "success",
  cancelled: "danger",
  withdrawn: "danger",
  rejected: "danger",
  failed: "danger",
  overdue: "danger",
  delayed: "danger",
  expired: "danger",
  archived: "neutral",
  draft: "neutral",
  inactive: "neutral",
  open: "info",
  in_progress: "warning",
  waiting_customer: "warning",
  resolved: "success",
  closed: "neutral",
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
};
export function statusColor(status: string): StatusTone {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  return STATUS_COLOR_MAP[key] ?? "default";
}

export function statusBadgeClass(status: string): string {
  const tone = statusColor(status);
  const map: Record<StatusTone, string> = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    info: "bg-sky-50 text-sky-700",
    neutral: "bg-slate-100 text-slate-600",
  };
  return map[tone];
}
