"use client";

import { useEffect } from "react";

import { hydrateCustomerExperienceFeed } from "@/lib/cx-feed";

export function CxFeedHydrator() {
  useEffect(() => {
    void hydrateCustomerExperienceFeed();
  }, []);
  return null;
}
