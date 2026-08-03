const NUMBER_FORMATTER = new Intl.NumberFormat("en-IN");

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  if (options) {
    return new Intl.NumberFormat("en-IN", options).format(value);
  }
  return NUMBER_FORMATTER.format(value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
