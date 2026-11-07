"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AUTH_COOKIE_NAME,
  AUTH_STORAGE_KEY,
  clearSessionTokens,
  persistSessionTokens,
} from "@/lib/auth-session";
import {
  claimCustomerDataOwner,
  clearCustomerData,
} from "@/lib/customer-data-reset";
import { env } from "@/lib/env";
import { indianMobileDigits } from "@/lib/phone";
import {
  authErrorMessage,
  fetchCurrentUser,
  isOtpRateLimited,
  otpRetryAfterSeconds,
  resendAuthOtp,
  sendAuthOtp,
  verifyAuthOtp,
  type AuthSessionPayload,
  type BackendAuthUser,
} from "@/services/auth";

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
}

export type AuthActionResult = {
  ok: boolean;
  message?: string;
  /** From MSG91 send/resend — drives the Resend countdown. */
  resendCooldownSeconds?: number;
  /** True when send was blocked because an OTP was already issued. */
  alreadySent?: boolean;
};

export interface AuthStoreState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  pendingContact: string | null;
  otpSource: "login" | "register" | "otp-continue" | "forgot-password" | null;
  /** Last server-reported resend cooldown (not persisted). */
  otpResendCooldownSeconds: number;
  rememberMe: boolean;
  forgotPasswordEmail: string | null;
  otpVerified: boolean;
  passwordResetCompleted: boolean;
}

export interface AuthStoreActions {
  continueWithOTP: (identifier: string) => Promise<AuthActionResult>;
  register: (payload: RegisterPayload) => Promise<AuthActionResult>;
  verifyOTP: (otp: string) => Promise<{ success: boolean; message?: string }>;
  resendOTP: () => Promise<AuthActionResult>;
  /** @deprecated Password reset retired — mobile OTP login only. */
  sendResetCode: (email: string) => Promise<boolean>;
  /** @deprecated Password reset retired — mobile OTP login only. */
  verifyResetOTP: (
    otp: string,
  ) => Promise<{ success: boolean; message?: string }>;
  /** @deprecated Password reset retired — mobile OTP login only. */
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

const DEFAULT_OTP_COOLDOWN = 60;

const initialState: AuthStoreState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  pendingContact: null,
  otpSource: null,
  otpResendCooldownSeconds: DEFAULT_OTP_COOLDOWN,
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
  claimCustomerDataOwner(session.user.id);
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

      continueWithOTP: async (identifier) => {
        set({ isLoading: true });
        const contact = indianMobileDigits(identifier);
        if (contact.length !== 10) {
          set({ isLoading: false });
          return {
            ok: false,
            message: "Enter a valid 10-digit mobile number",
          };
        }
        try {
          const sent = await sendAuthOtp(contact, "LOGIN");
          const cooldown = sent.resendCooldownSeconds ?? DEFAULT_OTP_COOLDOWN;
          set({
            isLoading: false,
            pendingContact: contact,
            otpSource: "otp-continue",
            otpResendCooldownSeconds: cooldown,
            isAuthenticated: false,
          });
          return { ok: true, resendCooldownSeconds: cooldown };
        } catch (error) {
          if (isOtpRateLimited(error)) {
            const cooldown =
              otpRetryAfterSeconds(error) ?? DEFAULT_OTP_COOLDOWN;
            set({
              isLoading: false,
              pendingContact: contact,
              otpSource: "otp-continue",
              otpResendCooldownSeconds: cooldown,
              isAuthenticated: false,
            });
            return {
              ok: true,
              alreadySent: true,
              resendCooldownSeconds: cooldown,
              message: "An OTP was already sent. Enter the code from your SMS.",
            };
          }
          set({ isLoading: false });
          return {
            ok: false,
            message: authErrorMessage(error, "Unable to send OTP"),
          };
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        const contact = indianMobileDigits(payload.phone);
        if (contact.length !== 10) {
          set({ isLoading: false });
          return {
            ok: false,
            message: "Enter a valid 10-digit mobile number",
          };
        }
        try {
          const sent = await sendAuthOtp(contact, "SIGNUP");
          const cooldown = sent.resendCooldownSeconds ?? DEFAULT_OTP_COOLDOWN;
          set({
            isLoading: false,
            pendingContact: contact,
            otpSource: "register",
            otpResendCooldownSeconds: cooldown,
            user: {
              id: "",
              name: payload.businessName,
              email: payload.email,
              phone: contact,
              companyName: payload.businessName,
            },
          });
          return { ok: true, resendCooldownSeconds: cooldown };
        } catch (error) {
          if (isOtpRateLimited(error)) {
            const cooldown =
              otpRetryAfterSeconds(error) ?? DEFAULT_OTP_COOLDOWN;
            set({
              isLoading: false,
              pendingContact: contact,
              otpSource: "register",
              otpResendCooldownSeconds: cooldown,
            });
            return {
              ok: true,
              alreadySent: true,
              resendCooldownSeconds: cooldown,
              message: "An OTP was already sent. Enter the code from your SMS.",
            };
          }
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

        try {
          const session = await verifyAuthOtp(contact, otp, purpose);
          applyAuthSession(set, session, state.rememberMe);
          return { success: true };
        } catch (error) {
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
          const purpose =
            get().otpSource === "forgot-password"
              ? "PASSWORD_RESET"
              : get().otpSource === "register"
                ? "SIGNUP"
                : "LOGIN";
          const sent = await resendAuthOtp(contact, purpose);
          const cooldown = sent.resendCooldownSeconds ?? DEFAULT_OTP_COOLDOWN;
          set({ otpResendCooldownSeconds: cooldown });
          return { ok: true, resendCooldownSeconds: cooldown };
        } catch (error) {
          if (isOtpRateLimited(error)) {
            const cooldown =
              otpRetryAfterSeconds(error) ??
              get().otpResendCooldownSeconds ??
              DEFAULT_OTP_COOLDOWN;
            set({ otpResendCooldownSeconds: cooldown });
            return {
              ok: true,
              alreadySent: true,
              resendCooldownSeconds: cooldown,
              message: "Please wait before requesting another OTP.",
            };
          }
          return {
            ok: false,
            message: authErrorMessage(error, "Unable to resend OTP"),
          };
        }
      },

      sendResetCode: async () => false,
      verifyResetOTP: async () => ({
        success: false,
        message: "Password login is disabled. Sign in with mobile OTP.",
      }),
      resetPassword: async () => false,

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
        clearCustomerData();
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
