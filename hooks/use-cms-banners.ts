"use client";

import { useEffect, useState } from "react";
import { fetchCustomerBanners } from "@/services/cms";
import type { CmsBanner, CmsBannerPlacement } from "@/types/cms-banner";

export function useCmsBanners(placement: CmsBannerPlacement) {
  const [banners, setBanners] = useState<CmsBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void fetchCustomerBanners(placement)
      .then((items) => {
        if (!cancelled) setBanners(items);
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [placement]);

  return { banners, isLoading };
}
