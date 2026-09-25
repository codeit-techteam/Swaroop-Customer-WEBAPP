"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ensureFreshAccessToken } from "@/lib/apiClient";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  getAccessToken,
  getJwtExpiryMs,
  isUsableJwt,
} from "@/lib/auth-session";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useDeliveryLocationStore } from "@/store/deliveryLocationStore";
import { useMarketplaceStore } from "@/store/marketplaceStore";

/**
 * After persist rehydration, confirm the JWT with /auth/me and load the
 * backend cart so Customer WEBAPP stays in sync with the mobile APP.
 *
 * Also keeps the access token fresh (backend JWT defaults to 15m) so catalog
 * calls do not fail with a generic Network Error after the session quietly expires.
 */
export function SessionHydrator() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const resetLocalCart = useCartStore((state) => state.resetLocalCart);
  const hydrated = useRef(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const finish = () => {
      hydrated.current = true;
      const state = useAuthStore.getState();
      if (isUsableJwt(state.token)) {
        void state.refreshProfile();
      }
    };

    if (useAuthStore.persist.hasHydrated()) {
      finish();
    }
    return useAuthStore.persist.onFinishHydration(finish);
  }, []);

  useEffect(() => {
    if (!hydrated.current && !isUsableJwt(token)) return;
    if (isAuthenticated && isUsableJwt(token)) {
      void fetchCart();
    }
  }, [fetchCart, isAuthenticated, token]);

  // Proactive refresh ~60s before JWT expiry (single-flight inside apiClient).
  useEffect(() => {
    const clearTimer = () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
    };

    const schedule = () => {
      clearTimer();
      if (!useAuthStore.getState().isAuthenticated) return;

      const access = getAccessToken() ?? useAuthStore.getState().token;
      const exp = getJwtExpiryMs(access);
      if (exp == null) return;

      const delay = Math.max(exp - Date.now() - 60_000, 5_000);
      refreshTimer.current = setTimeout(() => {
        void ensureFreshAccessToken().then((next) => {
          if (next) schedule();
        });
      }, delay);
    };

    schedule();
    return clearTimer;
  }, [isAuthenticated, token]);

  // Refresh failed → clear local session and send user to login.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onExpired = () => {
      resetLocalCart();
      useDeliveryLocationStore.getState().clearForLogout();
      useMarketplaceStore.setState({
        hasLoaded: false,
        loadError: null,
        products: [],
      });
      const next = window.location.pathname + window.location.search;
      const loginUrl =
        next && next !== ROUTES.login
          ? `${ROUTES.login}?next=${encodeURIComponent(next)}`
          : ROUTES.login;
      router.replace(loginUrl);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onExpired);
    return () =>
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onExpired);
  }, [resetLocalCart, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated) {
        resetLocalCart();
        useDeliveryLocationStore.getState().clearForLogout();
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [resetLocalCart]);

  return null;
}
