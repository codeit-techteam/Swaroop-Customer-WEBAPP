"use client";

import { useCallback, useMemo, useState } from "react";

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export function usePagination(initial?: Partial<PaginationState>) {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [pageSize, setPageSize] = useState(initial?.pageSize ?? 10);
  const [total, setTotal] = useState(initial?.total ?? 0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize],
  );

  const canPrevious = page > 1;
  const canNext = page < totalPages;

  const goToPage = useCallback(
    (next: number) => {
      setPage(Math.min(Math.max(1, next), totalPages));
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    if (canNext) setPage((p) => p + 1);
  }, [canNext]);

  const previousPage = useCallback(() => {
    if (canPrevious) setPage((p) => p - 1);
  }, [canPrevious]);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    pageSize,
    total,
    totalPages,
    canPrevious,
    canNext,
    setPage: goToPage,
    setPageSize,
    setTotal,
    nextPage,
    previousPage,
    reset,
  };
}
