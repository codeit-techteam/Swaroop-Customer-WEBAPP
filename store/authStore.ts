"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { env } from "@/lib/env";
import { apiClient } from "@/lib/apiClient";

export const DEV_OTP = "123456";
export const DEV_PHONE = "8240890242";
export const DEV_USER_NAME = "Karan Veer";
export const DEV_CUSTOMER_EMAIL = "customer@test.local";
export const DEV_PASSWORD = "Test@12345";
export const AUTH_COOKIE_NAME = env.authCookieName;
const AUTH_STORAGE_KEY = "pt-customer-auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  role?: string;
  designation?: string;
  avatarUrl?: string | null;
}

export interface RegisterPayload {
  businessName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthStoreState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  /** Pending identifier shown on OTP screen (email or phone) */
  pendingContact: string | null;
  /** Origin of the OTP challenge */
  otpSource: "login" | "register" | "otp-continue" | "forgot-password" | null;
  rememberMe: boolean;
  /** Email collected during forgot-password flow */
  forgotPasswordEmail: string | null;
  /** Whether reset OTP was verified successfully */
  otpVerified: boolean;
  /** Whether password was updated in the reset flow */
  passwordResetCompleted: boolean;
}

export interface AuthStoreActions {
  login: (
    identifier: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<boolean>;
  continueWithOTP: (identifier: string) => void;
  register: (payload: RegisterPayload) => Promise<boolean>;
  verifyOTP: (otp: string) => Promise<{ success: boolean; message?: string }>;
  resendOTP: () => void;
  sendResetCode: (email: string) => Promise<boolean>;
  verifyResetOTP: (
    otp: string,
  ) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (password: string) => Promise<boolean>;
  clearResetFlow: () => void;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  setLoading: (loading: boolean) => void;
  hydrateFromCookie: () => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

const initialState: AuthStoreState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  pendingContact: null,
  otpSource: null,
  rememberMe: false,
  forgotPasswordEmail: null,
  otpVerified: false,
  passwordResetCompleted: false,
};

function setAuthCookie(token: string, rememberMe: boolean): void {
  if (typeof document === "undefined") return;
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

function createMockToken(): string {
  return `mock_token_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createMockUser(
  partial: Partial<AuthUser> & Pick<AuthUser, "email">,
): AuthUser {
  return {
    id: partial.id ?? `usr_${Date.now()}`,
    name: partial.name ?? DEV_USER_NAME,
    email: partial.email,
    phone: partial.phone,
    companyName: partial.companyName ?? "Karan Veer Trading",
    role: partial.role ?? "Procurement Manager",
    designation: partial.designation ?? "Procurement Manager",
    avatarUrl: partial.avatarUrl ?? null,
  };
}

function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}

/**
 * Mock authentication store — no backend.
 * Persists to localStorage; sets a cookie for middleware route guards.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLoading: (loading) => set({ isLoading: loading }),

      login: async (identifier, password, rememberMe = false) => {
        set({ isLoading: true });
        try {
          const digits = identifier.replace(/\D/g, "").slice(-10);
          const email = looksLikeEmail(identifier)
            ? identifier.trim().toLowerCase()
            : digits === DEV_PHONE
              ? DEV_CUSTOMER_EMAIL
              : DEV_CUSTOMER_EMAIL;
          const payload = await apiClient.post<{
            success: boolean;
            data: {
              accessToken: string;
              refreshToken?: string;
              user: {
                id: string;
                email?: string | null;
                firstName?: string | null;
                lastName?: string | null;
              };
            };
          }>("/auth/login", { email, password: password || DEV_PASSWORD });
          const token = payload.data.accessToken;
          const backendUser = payload.data.user;
          const user = createMockUser({
            id: backendUser.id,
            email: backendUser.email ?? email,
            name:
              [backendUser.firstName, backendUser.lastName].filter(Boolean).join(" ") ||
              DEV_USER_NAME,
            phone: looksLikeEmail(identifier)
              ? DEV_PHONE
              : digits || DEV_PHONE,
          });
          setAuthCookie(token, rememberMe);
          try {
            window.localStorage.setItem(env.authCookieName, token);
          } catch {
            /* ignore */
          }
          set({
            isAuthenticated: true,
            user,
            token,
            isLoading: false,
            rememberMe,
            pendingContact: null,
            otpSource: null,
            forgotPasswordEmail: null,
            otpVerified: false,
            passwordResetCompleted: false,
          });
          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      continueWithOTP: (identifier) => {
        set({
          pendingContact: identifier.trim(),
          otpSource: "otp-continue",
          isAuthenticated: false,
        });
      },

      register: async (payload) => {
        set({ isLoading: true });
        await delay(700);

        set({
          isLoading: false,
          pendingContact: payload.phone || payload.email,
          otpSource: "register",
          user: createMockUser({
            email: payload.email,
            phone: payload.phone,
            name: payload.businessName,
            companyName: payload.businessName,
          }),
        });
        return true;
      },

      verifyOTP: async (otp) => {
        set({ isLoading: true });
        await delay(500);

        if (otp !== DEV_OTP) {
          set({ isLoading: false });
          return { success: false, message: "Invalid OTP. Use 123456 for demo." };
        }

        const state = get();
        const contact = state.pendingContact ?? DEV_PHONE;
        const digits = contact.replace(/\D/g, "").slice(-10) || DEV_PHONE;

        try {
          const payload = await apiClient.post<{
            success: boolean;
            data: {
              accessToken: string;
              refreshToken?: string;
              user: {
                id: string;
                email?: string | null;
                firstName?: string | null;
                lastName?: string | null;
              };
            };
          }>("/auth/login", {
            email: DEV_CUSTOMER_EMAIL,
            password: DEV_PASSWORD,
          });
          const token = payload.data.accessToken;
          const backendUser = payload.data.user;
          const user = createMockUser({
            id: backendUser.id,
            email: backendUser.email ?? DEV_CUSTOMER_EMAIL,
            name:
              [backendUser.firstName, backendUser.lastName].filter(Boolean).join(" ") ||
              DEV_USER_NAME,
            phone: digits,
          });
          setAuthCookie(token, state.rememberMe);
          set({
            isAuthenticated: true,
            user,
            token,
            isLoading: false,
            pendingContact: null,
            otpSource: null,
          });
          return { success: true };
        } catch {
          const token = createMockToken();
          const user = createMockUser({
            email: DEV_CUSTOMER_EMAIL,
            phone: digits,
            name: DEV_USER_NAME,
          });
          setAuthCookie(token, state.rememberMe);
          set({
            isAuthenticated: true,
            user,
            token,
            isLoading: false,
            pendingContact: null,
            otpSource: null,
          });
          return { success: true };
        }
      },

      resendOTP: () => {
        // Mock only — timer restart handled by UI
      },

      sendResetCode: async (email) => {
        set({ isLoading: true });
        await delay(650);

        const normalized = email.trim().toLowerCase();
        set({
          isLoading: false,
          forgotPasswordEmail: normalized,
          pendingContact: normalized,
          otpSource: "forgot-password",
          otpVerified: false,
          passwordResetCompleted: false,
        });
        return true;
      },

      verifyResetOTP: async (otp) => {
        set({ isLoading: true });
        await delay(500);

        if (otp !== DEV_OTP) {
          set({ isLoading: false });
          return { success: false, message: "Invalid verification code" };
        }

        set({
          isLoading: false,
          otpVerified: true,
        });
        return { success: true };
      },

      resetPassword: async (_password) => {
        set({ isLoading: true });
        await delay(700);

        set({
          isLoading: false,
          passwordResetCompleted: true,
          otpVerified: false,
          otpSource: null,
          pendingContact: null,
        });
        return true;
      },

      clearResetFlow: () => {
        set({
          forgotPasswordEmail: null,
          otpVerified: false,
          passwordResetCompleted: false,
          ...(get().otpSource === "forgot-password"
            ? { otpSource: null, pendingContact: null }
            : {}),
        });
      },

      logout: () => {
        clearAuthCookie();
        set({ ...initialState });
      },

      updateUser: (patch) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...patch } });
      },

      hydrateFromCookie: () => {
        if (typeof document === "undefined") return;
        const match = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${AUTH_COOKIE_NAME}=`));
        const token = match?.split("=")[1];
        if (!token) {
          if (get().isAuthenticated) {
            set({ ...initialState });
          }
          return;
        }
        if (!get().isAuthenticated) {
          set({
            isAuthenticated: true,
            token: decodeURIComponent(token),
            user:
              get().user ??
              createMockUser({ email: "procurement@petrotrade.com" }),
          });
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        pendingContact: state.pendingContact,
        otpSource: state.otpSource,
        rememberMe: state.rememberMe,
        forgotPasswordEmail: state.forgotPasswordEmail,
        otpVerified: state.otpVerified,
        passwordResetCompleted: state.passwordResetCompleted,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== "undefined") {
          window.localStorage.setItem(env.authCookieName, state.token);
        }
      },
    },
  ),
);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export { initialState as authStoreInitialState };
