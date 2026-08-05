/**
 * Relative timestamps and date grouping for the Notifications module.
 */

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diffMs = Math.max(0, now - t);
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export function startOfLocalDay(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export type DateGroupKey = "today" | "yesterday" | "last_week" | "older";

export function getDateGroupKey(iso: string, now = new Date()): DateGroupKey {
  const t = new Date(iso);
  const todayStart = startOfLocalDay(now).getTime();
  const yesterdayStart = todayStart - 86_400_000;
  const weekStart = todayStart - 7 * 86_400_000;
  const ts = t.getTime();
  if (ts >= todayStart) return "today";
  if (ts >= yesterdayStart) return "yesterday";
  if (ts >= weekStart) return "last_week";
  return "older";
}

export const DATE_GROUP_LABELS: Record<DateGroupKey, string> = {
  today: "Today",
  yesterday: "Yesterday",
  last_week: "Last Week",
  older: "Older",
};

export function isWithinTimeFilter(
  iso: string,
  filter: "all" | "today" | "yesterday" | "last_7_days" | "last_month",
  now = new Date(),
): boolean {
  if (filter === "all") return true;
  const ts = new Date(iso).getTime();
  const todayStart = startOfLocalDay(now).getTime();
  if (filter === "today") return ts >= todayStart;
  if (filter === "yesterday") {
    return ts >= todayStart - 86_400_000 && ts < todayStart;
  }
  if (filter === "last_7_days") return ts >= todayStart - 7 * 86_400_000;
  if (filter === "last_month") return ts >= todayStart - 30 * 86_400_000;
  return true;
}
