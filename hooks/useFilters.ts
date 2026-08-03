"use client";

import { useCallback, useMemo, useState } from "react";

export type FilterValue = string | number | boolean | null | undefined;

export function useFilters<T extends Record<string, FilterValue>>(initial: T) {
  const [filters, setFilters] = useState<T>(initial);

  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initial);
  }, [initial]);

  const activeCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      const initialValue = initial[key as keyof T];
      return value !== initialValue && value !== "" && value != null;
    }).length;
  }, [filters, initial]);

  return {
    filters,
    setFilters,
    setFilter,
    resetFilters,
    activeCount,
  };
}
