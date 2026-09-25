import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import { axiosInstance } from "@/lib/axios";
import { env } from "@/lib/env";
import {
  clearSessionTokens,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  notifySessionExpired,
  persistSessionTokens,
} from "@/lib/auth-session";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    skipRefresh?: boolean;
    _retry?: boolean;
  }
}

type AuthRequestConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  _retry?: boolean;
};

const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/otp/send",
  "/auth/otp/verify",
  "/auth/refresh",
  "/auth/password/forgot",
  "/auth/password/reset",
];

function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

function unwrapTokenPayload(body: unknown): {
  accessToken?: string;
  refreshToken?: string;
} {
  if (!body || typeof body !== "object") return {};
  const root = body as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  return {
    accessToken:
      typeof nested.accessToken === "string" ? nested.accessToken : undefined,
    refreshToken:
      typeof nested.refreshToken === "string" ? nested.refreshToken : undefined,
  };
}

/** Keep in-memory Zustand store aligned with rotated tokens (avoids circular import). */
async function syncAuthStoreTokens(
  accessToken: string,
  refreshToken?: string,
): Promise<void> {
  try {
    const { useAuthStore } = await import("@/store/authStore");
    const current = useAuthStore.getState();
    useAuthStore.setState({
      isAuthenticated: true,
      token: accessToken,
      refreshToken: refreshToken ?? current.refreshToken,
    });
  } catch {
    /* store may be unavailable during early boot */
  }
}

async function forceSessionExpiry(): Promise<void> {
  clearSessionTokens();
  try {
    const { useAuthStore } = await import("@/store/authStore");
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
    });
  } catch {
    /* ignore */
  }
  notifySessionExpired();
}

/** Single-flight refresh so concurrent 401s share one rotation. */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      // Bare client — never recurse through the 401 interceptor.
      const response = await axios.post(
        `${env.apiBaseUrl}/auth/refresh`,
        { refreshToken },
        {
          timeout: env.apiTimeout,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );
      const payload = unwrapTokenPayload(response.data);
      const accessToken = payload.accessToken;
      if (!accessToken) return null;

      const nextRefresh = payload.refreshToken ?? refreshToken;
      persistSessionTokens(accessToken, nextRefresh);
      await syncAuthStoreTokens(accessToken, nextRefresh);
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/**
 * Ensure a non-expired access token is available (proactive refresh).
 * Returns the token to use, or null if the session cannot be recovered.
 */
export async function ensureFreshAccessToken(): Promise<string | null> {
  const current = getAccessToken();
  if (current && !isAccessTokenExpired(current)) {
    return current;
  }
  if (!getRefreshToken()) {
    return current && !isAccessTokenExpired(current, 0) ? current : null;
  }
  const refreshed = await refreshAccessToken();
  if (refreshed) return refreshed;
  await forceSessionExpiry();
  return null;
}

function shouldAttemptRefresh(
  error: AxiosError,
  original: AuthRequestConfig,
): boolean {
  if (
    original.skipRefresh ||
    original._retry ||
    isPublicAuthRequest(original.url)
  ) {
    return false;
  }

  const status = error.response?.status;
  if (status === 401) return true;

  // CORS-masked 401s / aborted auth responses surface as "Network Error" with no
  // response. Only retry refresh when the access JWT is already past expiry.
  if (!error.response && isAccessTokenExpired(getAccessToken(), 0)) {
    return Boolean(getRefreshToken());
  }

  return false;
}

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const request = config as AuthRequestConfig;
    if (!request.skipAuth && !isPublicAuthRequest(config.url)) {
      let token = getAccessToken();
      if (token && isAccessTokenExpired(token) && getRefreshToken()) {
        token = (await refreshAccessToken()) ?? token;
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = error.config as AuthRequestConfig | undefined;
    if (!original || !shouldAttemptRefresh(error, original)) {
      return Promise.reject(error);
    }

    const sentHeader = String(original.headers?.Authorization ?? "");
    const latest = getAccessToken();
    if (
      latest &&
      !sentHeader.includes(latest) &&
      !isAccessTokenExpired(latest, 0)
    ) {
      original.headers.Authorization = `Bearer ${latest}`;
      original._retry = true;
      return axiosInstance(original);
    }

    if (!sentHeader.startsWith("Bearer ") && !getRefreshToken()) {
      return Promise.reject(error);
    }

    original._retry = true;
    const token = await refreshAccessToken();
    if (!token) {
      await forceSessionExpiry();
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${token}`;
    return axiosInstance(original);
  },
);

export const apiClient = {
  get: <T>(url: string, config?: Parameters<typeof axiosInstance.get>[1]) =>
    axiosInstance.get<T>(url, config).then((res) => res.data),
  post: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof axiosInstance.post>[2],
  ) => axiosInstance.post<T>(url, data, config).then((res) => res.data),
  put: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof axiosInstance.put>[2],
  ) => axiosInstance.put<T>(url, data, config).then((res) => res.data),
  patch: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof axiosInstance.patch>[2],
  ) => axiosInstance.patch<T>(url, data, config).then((res) => res.data),
  delete: <T>(
    url: string,
    config?: Parameters<typeof axiosInstance.delete>[1],
  ) => axiosInstance.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;
