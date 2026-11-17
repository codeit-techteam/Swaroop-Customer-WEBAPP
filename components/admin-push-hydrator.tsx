"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { hydrateAdminPushInbox } from "@/lib/admin-push";
import { useAuthStore } from "@/store/authStore";
import { useNotificationsCatalogStore } from "@/store/notificationsCatalogStore";

const POLL_MS = 20_000;

export function AdminPushHydrator() {
  const isHydrated = useNotificationsCatalogStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      useNotificationsCatalogStore.getState().dropSampleAdminPushes();
      return;
    }
    let cancelled = false;

    const pull = async (announce: boolean) => {
      const added = await hydrateAdminPushInbox();
      if (!cancelled && announce && added > 0) {
        toast.success(
          added === 1
            ? "New notification from PolyStoreX Admin"
            : `${added} new notifications from PolyStoreX Admin`,
        );
      }
    };

    void pull(false);
    const timer = window.setInterval(() => {
      void pull(true);
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isAuthenticated, isHydrated]);

  return null;
}
