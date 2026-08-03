const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatCurrency(
  amount: number,
  options?: Intl.NumberFormatOptions,
): string {
  if (options) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      ...options,
    }).format(amount);
  }
  return INR_FORMATTER.format(amount);
}
