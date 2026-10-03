"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AUTH_COOKIE_NAME,
  AUTH_STORAGE_KEY,
  clearSessionTokens,
  persistSessionTokens,
} from "@/lib/auth-session";
import { env } from "@/lib/env";
import { isOtpPasscode, looksLikeEmail } from "@/lib/phone";
import {
  authErrorMessage,
  fetchCurrentUser,
  isOtpRateLimited,
  loginWithPassword,
  sendAuthOtp,
  verifyAuthOtp,
  type AuthSessionPayload,
  type BackendAuthUser,
} from "@/services/auth";

export const DEV_OTP = "123456";
export const DEV_PHONE = "8240890242";
export const DEV_USER_NAME = "Karan Veer";
export const DEV_CUSTOMER_EMAIL = "customer@test.local";
export const DEV_PASSWORD = "Test@12345";
export { AUTH_COOKIE_NAME };

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

export type AuthActionResult = { ok: boolean; message?: string };

export interface AuthStoreState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  pendingContact: string | null;
  otpSource: "login" | "register" | "otp-continue" | "forgot-password" | null;
  rememberMe: boolean;
  forgotPasswordEmail: string | null;
  otpVerified: boolean;
  passwordResetCompleted: boolean;
}

export interface AuthStoreActions {
  login: (
    identifier: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<AuthActionResult>;
  continueWithOTP: (identifier: string) => Promise<AuthActionResult>;
  register: (payload: RegisterPayload) => Promise<AuthActionResult>;
  verifyOTP: (otp: string) => Promise<{ success: boolean; message?: string }>;
  resendOTP: () => Promise<AuthActionResult>;
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
  applySession: (session: AuthSessionPayload, rememberMe?: boolean) => void;
  refreshProfile: () => Promise<void>;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

const initialState: AuthStoreState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  pendingContact: null,
  otpSource: null,
  rememberMe: false,
  forgotPasswordEmail: null,
  otpVerified: false,
  passwordResetCompleted: false,
};

function toAuthUser(
  user: BackendAuthUser,
  fallback?: Partial<AuthUser>,
): AuthUser {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    fallback?.name ||
    "Customer";
  return {
    id: user.id,
    name,
    email: user.email ?? fallback?.email ?? "",
    phone: user.phone ?? fallback?.phone,
    companyName: fallback?.companyName,
    role: user.roles?.[0] ?? fallback?.role ?? "CUSTOMER",
    designation: fallback?.designation,
    avatarUrl: fallback?.avatarUrl ?? null,
  };
}

function applyAuthSession(
  set: (partial: Partial<AuthStoreState>) => void,
  session: AuthSessionPayload,
  rememberMe: boolean,
  extra?: Partial<AuthStoreState>,
): void {
  persistSessionTokens(session.accessToken, session.refreshToken, rememberMe);
  set({
    isAuthenticated: true,
    user: toAuthUser(session.user),
    token: session.accessToken,
    refreshToken: session.refreshToken ?? null,
    isLoading: false,
    rememberMe,
    pendingContact: null,
    otpSource: null,
    forgotPasswordEmail: null,
    otpVerified: false,
    passwordResetCompleted: false,
    ...extra,
  });
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLoading: (loading) => set({ isLoading: loading }),

      applySession: (session, rememberMe = get().rememberMe) => {
        applyAuthSession(set, session, rememberMe);
      },

      login: async (identifier, password, rememberMe = false) => {
        set({ isLoading: true, rememberMe });
        try {
          if (!looksLikeEmail(identifier) && isOtpPasscode(password)) {
            try {
              await sendAuthOtp(identifier, "LOGIN");
            } catch {
              /* OTP may already be in-flight from a previous send */
            }
            const session = await verifyAuthOtp(identifier, password, "LOGIN");
            applyAuthSession(set, session, rememberMe);
            return { ok: true };
          }

          const session = await loginWithPassword(identifier, password);
          applyAuthSession(set, session, rememberMe);
          return { ok: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            ok: false,
            message: authErrorMessage(error, "Invalid credentials"),
          };
        }
      },

      continueWithOTP: async (identifier) => {
        set({ isLoading: true });
        try {
          await sendAuthOtp(identifier, "LOGIN");
          set({
            isLoading: false,
            pendingContact: identifier.trim(),
            otpSource: "otp-continue",
            isAuthenticated: false,
          });
          return { ok: true };
        } catch (error) {
          if (isOtpRateLimited(error)) {
            set({
              isLoading: false,
              pendingContact: identifier.trim(),
              otpSource: "otp-continue",
            });
            return { ok: true };
          }
          set({
            isLoading: false,
            pendingContact: identifier.trim(),
            otpSource: "otp-continue",
          });
          return {
            ok: false,
            message: authErrorMessage(error, "Unable to send OTP"),
          };
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          await sendAuthOtp(payload.phone || payload.email, "SIGNUP");
          set({
            isLoading: false,
            pendingContact: payload.phone || payload.email,
            otpSource: "register",
            user: {
              id: "",
              name: payload.businessName,
              email: payload.email,
              phone: payload.phone,
              companyName: payload.businessName,
            },
          });
          return { ok: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            ok: false,
            message: authErrorMessage(error, "Unable to start registration"),
          };
        }
      },

      verifyOTP: async (otp) => {
        set({ isLoading: true });
        const state = get();
        const contact = state.pendingContact;
        if (!contact) {
          set({ isLoading: false });
          return {
            success: false,
            message: "Start login again to receive a new OTP.",
          };
        }

        const purpose = state.otpSource === "register" ? "SIGNUP" : "LOGIN";
        const digits = contact.replace(/\D/g, "").slice(-10);
        const isDemo =
          process.env.NODE_ENV !== "production" &&
          otp === DEV_OTP &&
          (digits === DEV_PHONE ||
            contact.toLowerCase() === DEV_CUSTOMER_EMAIL);

        try {
          const session = await verifyAuthOtp(contact, otp, purpose);
          applyAuthSession(set, session, state.rememberMe);
          return { success: true };
        } catch (error) {
          if (isDemo) {
            try {
              const session = await loginWithPassword(
                digits === DEV_PHONE ? DEV_PHONE : DEV_CUSTOMER_EMAIL,
                DEV_PASSWORD,
              );
              applyAuthSession(set, session, state.rememberMe);
              return { success: true };
            } catch (fallbackError) {
              set({ isLoading: false });
              return {
                success: false,
                message: authErrorMessage(
                  fallbackError,
                  "Demo login failed. Confirm backend + seeded Karan Veer user.",
                ),
              };
            }
          }
          set({ isLoading: false });
          return {
            success: false,
            message: authErrorMessage(error, "Invalid OTP"),
          };
        }
      },

      resendOTP: async () => {
        const contact = get().pendingContact || get().forgotPasswordEmail;
        if (!contact) {
          return {
            ok: false,
            message: "Start login again to receive a new OTP.",
          };
        }
        try {
          await sendAuthOtp(
            contact,
            get().otpSource === "forgot-password" ? "PASSWORD_RESET" : "LOGIN",
          );
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            message: authErrorMessage(error, "Unable to resend OTP"),
          };
        }
      },

      sendResetCode: async (email) => {
        set({ isLoading: true });
        const normalized = email.trim().toLowerCase();
        try {
          await sendAuthOtp(normalized, "PASSWORD_RESET");
          set({
            isLoading: false,
            forgotPasswordEmail: normalized,
            pendingContact: normalized,
            otpSource: "forgot-password",
            otpVerified: false,
            passwordResetCompleted: false,
          });
          return true;
        } catch {
          set({
            isLoading: false,
            forgotPasswordEmail: normalized,
            pendingContact: normalized,
            otpSource: "forgot-password",
          });
          return true;
        }
      },

      verifyResetOTP: async (otp) => {
        set({ isLoading: true });
        try {
          const contact = get().forgotPasswordEmail ?? get().pendingContact;
          if (!contact) {
            set({ isLoading: false });
            return { success: false, message: "Start reset again." };
          }
          await verifyAuthOtp(contact, otp, "PASSWORD_RESET");
          set({ isLoading: false, otpVerified: true });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: authErrorMessage(error, "Invalid verification code"),
          };
        }
      },

      resetPassword: async (_password) => {
        set({
          isLoading: true,
          passwordResetCompleted: true,
          otpVerified: false,
        });
        set({
          isLoading: false,
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
        clearSessionTokens();
        set({ ...initialState });
        // Clear customer-scoped delivery selection so the next login cannot
        // inherit another user's address (lazy import avoids store cycles).
        void import("@/store/deliveryLocationStore").then(
          ({ useDeliveryLocationStore }) => {
            useDeliveryLocationStore.getState().clearForLogout();
          },
        );
      },

      updateUser: (patch) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...patch } });
      },

      refreshProfile: async () => {
        const session = get();
        if (!session.token && !session.isAuthenticated) return;
        try {
          const user = await fetchCurrentUser();
          set({
            isAuthenticated: true,
            user: toAuthUser(user, session.user ?? undefined),
          });
        } catch {
          /* interceptor handles 401 */
        }
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
        refreshToken: state.refreshToken,
        pendingContact: state.pendingContact,
        otpSource: state.otpSource,
        rememberMe: state.rememberMe,
        forgotPasswordEmail: state.forgotPasswordEmail,
        otpVerified: state.otpVerified,
        passwordResetCompleted: state.passwordResetCompleted,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state?.token) return;
        // Prefer tokens already written by a silent refresh (pt_customer_* keys)
        // so rehydration never rolls back a rotated refresh token.
        const liveAccess =
          typeof window !== "undefined"
            ? window.localStorage.getItem(env.authCookieName) ||
              window.localStorage.getItem("pt-customer-access-token")
            : null;
        const liveRefresh =
          typeof window !== "undefined"
            ? window.localStorage.getItem(env.refreshTokenStorageKey)
            : null;
        const access =
          liveAccess && liveAccess.length > 40 ? liveAccess : state.token;
        const refresh = liveRefresh || state.refreshToken;
        if (access !== state.token || refresh !== state.refreshToken) {
          state.token = access;
          state.refreshToken = refresh ?? null;
        }
        persistSessionTokens(access, refresh, state.rememberMe);
      },
    },
  ),
);

export { initialState as authStoreInitialState };
