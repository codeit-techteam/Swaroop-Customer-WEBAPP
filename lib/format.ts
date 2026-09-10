/**
 * India-market formatting helpers (INR, DD/MM/YYYY, MT).
 */

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const INR_COMPACT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatInr(
  amount: number,
  options?: { compact?: boolean },
): string {
  if (options?.compact) {
    return INR_COMPACT.format(amount);
  }
  return INR_FORMATTER.format(amount);
}

export function formatInrPerMt(amount: number): string {
  return `${formatInr(amount, { compact: true })} / MT`;
}

export function formatQuantityMt(quantity: number): string {
  const formatted = Number.isInteger(quantity)
    ? quantity.toString()
    : quantity.toFixed(1);
  return `${formatted} MT`;
}

export function formatPercentChange(value: number): string {
  if (value === 0) return "0.0%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDateDdMmYyyy(isoDate: string): string {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Prefer a calendar date; fall back to a relative label such as "2–3 Business Days". */
export function formatEtaDisplay(
  value: string,
  fallbackLabel?: string | null,
): string {
  const formatted = formatDateDdMmYyyy(value);
  if (formatted !== "—") return formatted;
  const label = fallbackLabel?.trim() || value.trim();
  if (label && Number.isNaN(Date.parse(label))) return label;
  return "—";
}
