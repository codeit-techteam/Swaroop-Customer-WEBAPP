import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

function toDate(value: Date | string | number): Date | null {
  if (value instanceof Date) return isValid(value) ? value : null;
  if (typeof value === "number") {
    const d = new Date(value);
    return isValid(d) ? d : null;
  }
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

export function formatDate(
  value: Date | string | number,
  pattern = "dd MMM yyyy",
): string {
  const date = toDate(value);
  if (!date) return "—";
  return format(date, pattern);
}

export function formatDateTime(
  value: Date | string | number,
  pattern = "dd MMM yyyy, hh:mm a",
): string {
  return formatDate(value, pattern);
}

export function formatRelativeDate(value: Date | string | number): string {
  const date = toDate(value);
  if (!date) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}
