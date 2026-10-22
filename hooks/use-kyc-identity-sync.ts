"use client";

import { useEffect } from "react";

import { setOnboardingCompleteCookie } from "@/lib/onboarding-cookie";
import { fetchCustomerKyc } from "@/services/customer-kyc";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";

/**
 * Loads the company profile (organization + verified GST / PAN) from the backend
 * KYC record, the same source the mobile app reads. Refreshes when the tab
 * regains focus so an admin decision or a change made on another device shows up.
 *
 * Also aligns the onboarding cookie with backend `kycVerified` so middleware
 * cannot treat a local cookie as approved when KYC is still pending.
 */
export function useKycIdentitySync(enabled = true) {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const applyKycOverview = useProfileStore((s) => s.applyKycOverview);
  const setSyncStatus = useProfileStore((s) => s.setSyncStatus);

  useEffect(() => {
    if (!enabled || !userId) return;
    let active = true;

    const load = () => {
      if (useProfileStore.getState().syncStatus !== "ready")
        setSyncStatus("loading");
      fetchCustomerKyc()
        .then((overview) => {
          if (active && useAuthStore.getState().user?.id === userId) {
            applyKycOverview(overview);
            // Backend KYC is SoT — keep local onboarding completion in sync.
            setOnboardingCompleteCookie(overview.kycVerified);
            useOnboardingStore.setState({ isCompleted: overview.kycVerified });
          }
        })
        .catch(() => {
          if (active) setSyncStatus("error");
        });
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };

    load();
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, userId, applyKycOverview, setSyncStatus]);
}
