import { env } from "@/lib/env";

export const AUTH_STORAGE_KEY = "pt-customer-auth";
export const AUTH_COOKIE_NAME = env.authCookieName;
const ACCESS_KEYS = [env.authCookieName, "pt-customer-access-token"] as const;

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

export function isUsableJwt(token: string | null | undefined): boolean {
  return Boolean(token && token.length > 40 && !token.startsWith("mock_token_"));
}

export function getAccessToken(): string | null {
  if (isUsableJwt(memoryAccessToken)) return memoryAccessToken;
  if (typeof window === "undefined") return null;
  try {
    for (const key of ACCESS_KEYS) {
      const value = window.localStorage.getItem(key);
      if (isUsableJwt(value)) {
        memoryAccessToken = value;
        return value;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (memoryRefreshToken) return memoryRefreshToken;
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(env.refreshTokenStorageKey);
    if (value) memoryRefreshToken = value;
    return value;
  } catch {
    return null;
  }
}

export function persistSessionTokens(
  accessToken: string,
  refreshToken?: string | null,
  rememberMe = false,
): void {
  memoryAccessToken = accessToken;
  if (refreshToken) memoryRefreshToken = refreshToken;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(env.authCookieName, accessToken);
    window.localStorage.setItem("pt-customer-access-token", accessToken);
    if (refreshToken) {
      window.localStorage.setItem(env.refreshTokenStorageKey, refreshToken);
    }
  } catch {
    /* ignore */
  }

  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(accessToken)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearSessionTokens(): void {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(env.authCookieName);
    window.localStorage.removeItem("pt-customer-access-token");
    window.localStorage.removeItem(env.refreshTokenStorageKey);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
