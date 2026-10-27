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

type LoginBody = { password: string; email?: string; phone?: string };

function identifierPayload(identifier: string): {
  email?: string;
  phone?: string;
} {
  if (looksLikeEmail(identifier)) {
    return { email: identifier.trim().toLowerCase() };
  }
  return { phone: toE164IndianPhone(identifier) };
}

export function isOtpRateLimited(error: unknown): boolean {
  return (
    isAxiosError<{ code?: string }>(error) &&
    error.response?.data?.code === "AUTH_OTP_RATE_LIMITED"
  );
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

export async function loginWithPassword(
  identifier: string,
  password: string,
): Promise<AuthSessionPayload> {
  const payload = await apiClient.post<Envelope<AuthSessionPayload>>(
    "/auth/login",
    { ...identifierPayload(identifier), password } satisfies LoginBody,
    { skipAuth: true, skipRefresh: true },
  );
  return payload.data;
}

export async function sendAuthOtp(
  identifier: string,
  purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET" = "LOGIN",
): Promise<{ message: string; devOtp?: string }> {
  const payload = await apiClient.post<
    Envelope<{ message: string; devOtp?: string }>
  >(
    "/auth/otp/send",
    { ...identifierPayload(identifier), purpose },
    { skipAuth: true, skipRefresh: true },
  );
  return payload.data;
}

const DEMO_PHONE_LAST10 = "8240890242";
const DEMO_OTP = "123456";
const DEMO_PASSWORD = "Test@12345";

/** Development-phase demo phone + OTP 123456 (all customer panels). */
export function isDevDemoOtp(identifier: string, otp: string): boolean {
  if (otp !== DEMO_OTP) return false;
  const digits = identifier.replace(/\D/g, "").slice(-10);
  return digits === DEMO_PHONE_LAST10;
}

export async function verifyAuthOtp(
  identifier: string,
  otp: string,
  purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET" = "LOGIN",
): Promise<AuthSessionPayload> {
  try {
    const payload = await apiClient.post<Envelope<AuthSessionPayload>>(
      "/auth/otp/verify",
      { ...identifierPayload(identifier), otp, purpose, roleHint: "CUSTOMER" },
      { skipAuth: true, skipRefresh: true },
    );
    return payload.data;
  } catch (error) {
    // Development phase: demo phone + 123456 falls back to known password when
    // the API has not yet enabled fixed OTP (pre-redeploy / AUTH_STRICT_OTP off).
    if (purpose === "PASSWORD_RESET" || !isDevDemoOtp(identifier, otp)) {
      throw error;
    }
    try {
      return await loginWithPassword(identifier, DEMO_PASSWORD);
    } catch {
      throw error;
    }
  }
}

export async function fetchCurrentUser(): Promise<BackendAuthUser> {
  const payload = await apiClient.get<Envelope<BackendAuthUser>>("/auth/me");
  return payload.data;
}
