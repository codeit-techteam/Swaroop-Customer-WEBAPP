"use client";

import { useEffect } from "react";

import { fetchCustomerKyc } from "@/services/customer-kyc";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";

/**
 * Loads the company profile (organization + verified GST / PAN) from the backend
 * KYC record, the same source the mobile app reads. Refreshes when the tab
 * regains focus so an admin decision or a change made on another device shows up.
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
