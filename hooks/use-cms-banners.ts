"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCustomerBanners } from "@/services/cms";
import type { CmsBanner, CmsBannerPlacement } from "@/types/cms-banner";

const REFRESH_MS = 60_000;

/**
 * Live CMS banners for a placement (Admin → R2/DB → Customer WEBAPP).
 * Refetches periodically so Admin activate/pause/upload reflects without a hard reload.
 */
export function useCmsBanners(placement: CmsBannerPlacement) {
  const [banners, setBanners] = useState<CmsBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const items = await fetchCustomerBanners(placement);
      setBanners(items);
      setError(null);
      return items;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load banners",
      );
      return [] as CmsBanner[];
    }
  }, [placement]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void refresh()
      .then((items) => {
        if (!cancelled) setBanners(items);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    const timer = window.setInterval(() => {
      void refresh().then((items) => {
        if (!cancelled) setBanners(items);
      });
    }, REFRESH_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refresh().then((items) => {
          if (!cancelled) setBanners(items);
        });
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [placement, refresh]);

  return { banners, isLoading, error, refresh };
}
