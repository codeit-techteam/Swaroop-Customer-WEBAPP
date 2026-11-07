import { isAxiosError } from "axios";
import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";
import { looksLikeEmail, toE164IndianPhone } from "@/lib/phone";

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
};

export type BackendAuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  status?: string;
  roles?: string[];
  lastLoginAt?: string | null;
};

export type AuthSessionPayload = AuthTokens & {
  user: BackendAuthUser;
};

/** Customer portal login is mobile OTP only — always send E.164 phone. */
function phonePayload(phone: string): { phone: string } {
  return { phone: toE164IndianPhone(phone) };
}

function identifierPayload(identifier: string): {
  email?: string;
  phone?: string;
} {
  if (looksLikeEmail(identifier)) {
    return { email: identifier.trim().toLowerCase() };
  }
  return phonePayload(identifier);
}

export function isOtpRateLimited(error: unknown): boolean {
  return (
    isAxiosError<{ code?: string }>(error) &&
    error.response?.data?.code === "AUTH_OTP_RATE_LIMITED"
  );
}

/** Seconds to wait before another send — from AUTH_OTP_RATE_LIMITED details. */
export function otpRetryAfterSeconds(error: unknown): number | undefined {
  if (
    !isAxiosError<{
      details?: { retryAfterSeconds?: number };
    }>(error)
  ) {
    return undefined;
  }
  const retry = error.response?.data?.details?.retryAfterSeconds;
  return typeof retry === "number" && retry > 0 ? Math.ceil(retry) : undefined;
}

export function authErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string | string[]; code?: string }>(error)) {
    const payload = error.response?.data;
    const message = payload?.message;
    if (typeof message === "string" && message) return message;
    if (Array.isArray(message) && message[0]) return message[0];
    if (!error.response) {
      return "Unable to reach PolyStoreX. Confirm the backend is running.";
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export type AuthOtpSendResult = {
  message: string;
  devOtp?: string;
  resendCooldownSeconds?: number;
  expiresInSeconds?: number;
  smsDispatched?: boolean;
  correlationId?: string;
};

function assertSmsDispatched(data: AuthOtpSendResult): AuthOtpSendResult {
  // Production clients must not advance when the backend used a local/no-SMS stub.
  // Local/demo backends may set smsDispatched=false intentionally.
  if (data.smsDispatched === false && process.env.NODE_ENV === "production") {
    throw new Error(
      "SMS could not be dispatched. Please try again in a moment.",
    );
  }
  return data;
}

export type AuthOtpPurpose = "LOGIN" | "SIGNUP" | "PASSWORD_RESET";

/**
 * Send OTP for customer auth.
 * LOGIN / SIGNUP always use mobile number (never email).
 */
export async function sendAuthOtp(
  identifier: string,
  purpose: AuthOtpPurpose = "LOGIN",
): Promise<AuthOtpSendResult> {
  const body =
    purpose === "PASSWORD_RESET"
      ? { ...identifierPayload(identifier), purpose }
      : { ...phonePayload(identifier), purpose };

  const payload = await apiClient.post<Envelope<AuthOtpSendResult>>(
    "/auth/otp/send",
    body,
    { skipAuth: true, skipRefresh: true },
  );
  return assertSmsDispatched(payload.data);
}

/** Fresh OTP — invalidates the previous challenge server-side. */
export async function resendAuthOtp(
  identifier: string,
  purpose: AuthOtpPurpose = "LOGIN",
): Promise<AuthOtpSendResult> {
  const body =
    purpose === "PASSWORD_RESET"
      ? { ...identifierPayload(identifier), purpose }
      : { ...phonePayload(identifier), purpose };

  const payload = await apiClient.post<Envelope<AuthOtpSendResult>>(
    "/auth/otp/resend",
    body,
    { skipAuth: true, skipRefresh: true },
  );
  return assertSmsDispatched(payload.data);
}

export async function verifyAuthOtp(
  identifier: string,
  otp: string,
  purpose: AuthOtpPurpose = "LOGIN",
): Promise<AuthSessionPayload> {
  const contact =
    purpose === "PASSWORD_RESET"
      ? identifierPayload(identifier)
      : phonePayload(identifier);

  const payload = await apiClient.post<Envelope<AuthSessionPayload>>(
    "/auth/otp/verify",
    { ...contact, otp, purpose, roleHint: "CUSTOMER" },
    { skipAuth: true, skipRefresh: true },
  );
  return payload.data;
}

export async function fetchCurrentUser(): Promise<BackendAuthUser> {
  const payload = await apiClient.get<Envelope<BackendAuthUser>>("/auth/me");
  return payload.data;
}
