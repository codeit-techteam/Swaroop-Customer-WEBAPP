"use client";

import { useEffect, useRef } from "react";
import { isUsableJwt } from "@/lib/auth-session";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

/**
 * After persist rehydration, confirm the JWT with /auth/me and load the
 * backend cart so Customer WEBAPP stays in sync with the mobile APP.
 */
export function SessionHydrator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const resetLocalCart = useCartStore((state) => state.resetLocalCart);
  const hydrated = useRef(false);

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
      return;
    }
    return useAuthStore.persist.onFinishHydration(finish);
  }, []);

  useEffect(() => {
    if (!hydrated.current && !isUsableJwt(token)) return;
    if (isAuthenticated && isUsableJwt(token)) {
      void fetchCart();
    }
  }, [fetchCart, isAuthenticated, token]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated) {
        resetLocalCart();
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [resetLocalCart]);

  return null;
}
