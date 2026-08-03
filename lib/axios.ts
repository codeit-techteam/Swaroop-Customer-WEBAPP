import axios from "axios";
import { env } from "@/lib/env";

/**
 * Base Axios instance.
 * Interceptors and auth wiring live in apiClient.ts.
 * No live API calls in the foundation phase.
 */
export const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axiosInstance;
