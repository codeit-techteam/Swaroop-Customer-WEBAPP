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

function identifierPayload(identifier: string): { email?: string; phone?: string } {
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
      return "Unable to reach PetroTrade. Confirm the backend is running.";
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
  const payload = await apiClient.post<Envelope<{ message: string; devOtp?: string }>>(
    "/auth/otp/send",
    { ...identifierPayload(identifier), purpose },
    { skipAuth: true, skipRefresh: true },
  );
  return payload.data;
}

export async function verifyAuthOtp(
  identifier: string,
  otp: string,
  purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET" = "LOGIN",
): Promise<AuthSessionPayload> {
  const payload = await apiClient.post<Envelope<AuthSessionPayload>>(
    "/auth/otp/verify",
    { ...identifierPayload(identifier), otp, purpose, roleHint: "CUSTOMER" },
    { skipAuth: true, skipRefresh: true },
  );
  return payload.data;
}

export async function fetchCurrentUser(): Promise<BackendAuthUser> {
  const payload = await apiClient.get<Envelope<BackendAuthUser>>("/auth/me");
  return payload.data;
}
