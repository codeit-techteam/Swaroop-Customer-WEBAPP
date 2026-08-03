"use client";

import { useCallback, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export function useSearch(initialQuery = "", debounceMs = 300) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, debounceMs);

  const clear = useCallback(() => setQuery(""), []);

  return {
    query,
    setQuery,
    debouncedQuery,
    clear,
    isSearching: query !== debouncedQuery,
  };
}
