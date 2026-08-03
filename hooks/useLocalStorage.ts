"use client";

import { useCallback, useEffect, useState } from "react";
import { storage } from "@/utils/storage";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const value = storage.get<T>(key, initialValue);
    setStoredValue(value ?? initialValue);
    setHydrated(true);
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        storage.set(key, next);
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    storage.remove(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return { value: storedValue, setValue, remove, hydrated };
}
