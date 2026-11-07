/** Last 10 digits of an Indian mobile number, ignoring country code. */
export function indianMobileDigits(value: string): string {
  return value.replace(/\D/g, "").slice(-10);
}

export function isIndianMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(indianMobileDigits(value));
}

/** Backend OTP/login APIs expect E.164, e.g. +918240890242. */
export function toE164IndianPhone(value: string): string {
  return `+91${indianMobileDigits(value)}`;
}

export function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}

export function isOtpPasscode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

/** Mask an Indian mobile for OTP screens: +91 ******0242 */
export function maskIndianMobile(value?: string | null): string {
  const digits = indianMobileDigits(value ?? "");
  if (digits.length !== 10) return "+91 ******XXXX";
  return `+91 ******${digits.slice(-4)}`;
}
