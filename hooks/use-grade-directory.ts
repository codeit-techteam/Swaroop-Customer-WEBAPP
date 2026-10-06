"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchGradeDetail,
  fetchGradeDirectory,
  fetchGradeFacets,
  fetchGradeOffers,
  fetchGradeProducts,
} from "@/services/grade-directory";
import type {
  GradeDirectoryQuery,
  GradeFacetQuery,
} from "@/types/grade-directory";

export const gradeDirectoryKeys = {
  all: ["grade-directory"] as const,
  list: (query: GradeDirectoryQuery) =>
    ["grade-directory", "list", query] as const,
  detail: (id: string) => ["grade-directory", "detail", id] as const,
  offers: (id: string, page: number) =>
    ["grade-directory", "offers", id, page] as const,
  products: (id: string, page: number) =>
    ["grade-directory", "products", id, page] as const,
  facets: (query: GradeFacetQuery) =>
    ["grade-directory", "facets", query] as const,
};

export function useGradeDirectory(query: GradeDirectoryQuery) {
  return useQuery({
    queryKey: gradeDirectoryKeys.list(query),
    queryFn: () => fetchGradeDirectory(query),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useGradeFacets(query: GradeFacetQuery, enabled = true) {
  return useQuery({
    queryKey: gradeDirectoryKeys.facets(query),
    queryFn: () => fetchGradeFacets(query),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function useGradeDetail(id: string) {
  return useQuery({
    queryKey: gradeDirectoryKeys.detail(id),
    queryFn: () => fetchGradeDetail(id),
    enabled: Boolean(id),
    retry: (count, error) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404 || status === 400) return false;
      return count < 1;
    },
  });
}

export function useGradeOffers(id: string, page: number, enabled = true) {
  return useQuery({
    queryKey: gradeDirectoryKeys.offers(id, page),
    queryFn: () => fetchGradeOffers(id, page),
    placeholderData: keepPreviousData,
    enabled: Boolean(id) && enabled,
  });
}

export function useGradeProducts(id: string, page: number, enabled = true) {
  return useQuery({
    queryKey: gradeDirectoryKeys.products(id, page),
    queryFn: () => fetchGradeProducts(id, page),
    placeholderData: keepPreviousData,
    enabled: Boolean(id) && enabled,
  });
}
