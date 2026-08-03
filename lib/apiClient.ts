import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { axiosInstance } from "@/lib/axios";
import { env } from "@/lib/env";

/**
 * API client with request/response interceptors.
 * Auth token injection is a placeholder for future JWT integration.
 * No business API endpoints are called in this foundation phase.
 */

function getAuthTokenPlaceholder(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(env.authCookieName);
  } catch {
    return null;
  }
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthTokenPlaceholder();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Placeholder for future 401 / refresh-token handling
    if (error.response?.status === 401 && env.isDevelopment) {
      console.warn("[apiClient] Unauthorized — auth refresh not configured.");
    }
    return Promise.reject(error);
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
