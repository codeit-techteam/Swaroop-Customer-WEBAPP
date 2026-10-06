import { env } from "@/lib/env";

export const AUTH_STORAGE_KEY = "pt-customer-auth";
export const AUTH_COOKIE_NAME = env.authCookieName;
const ACCESS_KEYS = [env.authCookieName, "pt-customer-access-token"] as const;

/** Dispatched when refresh fails and the user must sign in again. */
export const AUTH_SESSION_EXPIRED_EVENT = "pt-customer-session-expired";

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

export function isUsableJwt(token: string | null | undefined): boolean {
  return Boolean(
    token && token.length > 40 && !token.startsWith("mock_token_"),
  );
}

/** Decode JWT `exp` (ms). Returns null if missing/invalid — never verifies signature. */
export function getJwtExpiryMs(
  token: string | null | undefined,
): number | null {
  if (!isUsableJwt(token) || !token) return null;
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const json = atob(segment.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** True when the access token is missing or within `skewMs` of expiry. */
export function isAccessTokenExpired(
  token: string | null | undefined,
  skewMs = 60_000,
): boolean {
  if (!isUsableJwt(token)) return true;
  const exp = getJwtExpiryMs(token);
  if (exp == null) return false;
  return Date.now() >= exp - skewMs;
}

// localStorage is read first so a token rotated by another tab is picked up;
// the memory copies only cover environments where storage is unavailable.
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return memoryAccessToken;
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
  return isUsableJwt(memoryAccessToken) ? memoryAccessToken : null;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return memoryRefreshToken;
  try {
    const value = window.localStorage.getItem(env.refreshTokenStorageKey);
    if (value) {
      memoryRefreshToken = value;
      return value;
    }
    // Fallback: Zustand persist blob (older sessions / partial writes)
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { refreshToken?: string | null };
    };
    const fromStore = parsed?.state?.refreshToken;
    if (typeof fromStore === "string" && fromStore.trim()) {
      memoryRefreshToken = fromStore.trim();
      window.localStorage.setItem(
        env.refreshTokenStorageKey,
        memoryRefreshToken,
      );
      return memoryRefreshToken;
    }
  } catch {
    return memoryRefreshToken;
  }
  return null;
}

function persistedRememberMe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { state?: { rememberMe?: unknown } };
    return parsed?.state?.rememberMe === true;
  } catch {
    return false;
  }
}

/** Keep Zustand persist in sync so rehydration cannot overwrite rotated tokens. */
function syncZustandPersistTokens(
  accessToken: string,
  refreshToken?: string | null,
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      state?: Record<string, unknown>;
      version?: number;
    };
    if (!parsed.state || typeof parsed.state !== "object") return;
    parsed.state.token = accessToken;
    parsed.state.isAuthenticated = true;
    if (refreshToken) {
      parsed.state.refreshToken = refreshToken;
    }
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}

export function persistSessionTokens(
  accessToken: string,
  refreshToken?: string | null,
  rememberMe: boolean = persistedRememberMe(),
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
    syncZustandPersistTokens(accessToken, refreshToken);
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

export function notifySessionExpired(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}
