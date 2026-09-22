import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { axiosInstance } from "@/lib/axios";
import { env } from "@/lib/env";
import {
  getAccessToken,
  getRefreshToken,
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

let isRefreshing = false;
const refreshQueue: Array<(token: string | null) => void> = [];

function flushRefreshQueue(token: string | null): void {
  while (refreshQueue.length) {
    refreshQueue.shift()?.(token);
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const response = await axios.post<{
      success: boolean;
      data: { accessToken: string; refreshToken?: string };
    }>(
      `${env.apiBaseUrl}/auth/refresh`,
      { refreshToken },
      { timeout: env.apiTimeout },
    );
    const accessToken = response.data.data.accessToken;
    if (!accessToken) return null;
    persistSessionTokens(accessToken, response.data.data.refreshToken ?? refreshToken);
    return accessToken;
  } catch {
    return null;
  }
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const request = config as AuthRequestConfig;
    if (!request.skipAuth && !isPublicAuthRequest(config.url)) {
      const token = getAccessToken();
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
    if (
      !original ||
      error.response?.status !== 401 ||
      original.skipRefresh ||
      original._retry ||
      isPublicAuthRequest(original.url)
    ) {
      return Promise.reject(error);
    }

    const sentHeader = String(original.headers?.Authorization ?? "");
    const latest = getAccessToken();
    if (latest && !sentHeader.includes(latest)) {
      original.headers.Authorization = `Bearer ${latest}`;
      original._retry = true;
      return axiosInstance(original);
    }

    if (!sentHeader.startsWith("Bearer ")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          original.headers.Authorization = `Bearer ${token}`;
          original._retry = true;
          resolve(axiosInstance(original));
        });
      });
    }

    isRefreshing = true;
    original._retry = true;
    const token = await refreshAccessToken();
    isRefreshing = false;
    flushRefreshQueue(token);

    const recovered = token ?? getAccessToken();
    if (!recovered) {
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${recovered}`;
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
