import { isAxiosError } from "axios";
import apiClient from "@/lib/apiClient";
import { asRecord, num, type Envelope } from "@/lib/api-envelope";
import {
  toMarketplaceOffer,
  toMarketplaceProduct,
  type BlindOffer,
  type BlindProduct,
} from "@/lib/catalog-mapper";
import type {
  GradeDirectoryItem,
  GradeDirectoryQuery,
  GradeFacetQuery,
  GradeFacets,
  PagedResult,
} from "@/types/grade-directory";
import type { MarketplaceProduct } from "@/types/marketplace";
import type { MarketplaceOffer } from "@/types/offers";

type Query = Record<string, string | number | boolean | undefined | null>;

function qs(query: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function toGradeDirectoryItem(raw: unknown): GradeDirectoryItem {
  const g = asRecord(raw);
  const category = g.category ? asRecord(g.category) : null;
  const name = str(g.name) ?? str(g.code) ?? "";
  return {
    id: String(g.id ?? ""),
    code: String(g.code ?? ""),
    name,
    displayName: str(g.displayName) ?? name,
    description: str(g.description),
    gradeGroup: str(g.gradeGroup),
    gradeNo: str(g.gradeNo),
    manufacturer: str(g.manufacturer),
    fullGradeName: str(g.fullGradeName),
    inTodaysDelhiPriceList: g.inTodaysDelhiPriceList === true,
    category: category
      ? {
          id: String(category.id ?? ""),
          code: String(category.code ?? ""),
          name: String(category.name ?? ""),
          displayName: str(category.displayName) ?? String(category.name ?? ""),
          parentGroup: str(category.parentGroup),
        }
      : null,
    liveOfferCount: num(g.liveOfferCount),
  };
}

function pagedFrom<T>(
  res: Envelope<unknown[]>,
  map: (raw: unknown) => T,
  fallbackLimit: number,
): PagedResult<T> {
  const items = (res.data ?? []).map(map);
  return {
    items,
    meta: res.meta ?? {
      page: 1,
      limit: fallbackLimit,
      total: items.length,
      totalPages: 1,
    },
  };
}

export async function fetchGradeDirectory(
  query: GradeDirectoryQuery,
): Promise<PagedResult<GradeDirectoryItem>> {
  const limit = Math.min(100, Math.max(1, query.limit ?? 24));
  const res = await apiClient.get<Envelope<unknown[]>>(
    `/customer/marketplace/grades${qs({
      page: query.page ?? 1,
      limit,
      search: query.search?.trim(),
      category: query.category,
      categoryId: query.categoryId,
      gradeGroup: query.gradeGroup,
      manufacturer: query.manufacturer,
      hasOffers: query.hasOffers ? true : undefined,
    })}`,
  );
  return pagedFrom(res, toGradeDirectoryItem, limit);
}

export async function fetchGradeDetail(
  id: string,
): Promise<GradeDirectoryItem> {
  const res = await apiClient.get<Envelope<unknown>>(
    `/customer/marketplace/grades/${encodeURIComponent(id)}`,
  );
  return toGradeDirectoryItem(res.data);
}

export async function fetchGradeProducts(
  id: string,
  page = 1,
  limit = 12,
): Promise<PagedResult<MarketplaceProduct>> {
  const res = await apiClient.get<Envelope<BlindProduct[]>>(
    `/customer/marketplace/grades/${encodeURIComponent(id)}/products${qs({ page, limit })}`,
  );
  return pagedFrom(
    res as Envelope<unknown[]>,
    (raw) => toMarketplaceProduct(raw as BlindProduct),
    limit,
  );
}

export async function fetchGradeOffers(
  id: string,
  page = 1,
  limit = 12,
): Promise<PagedResult<BlindOffer>> {
  const res = await apiClient.get<Envelope<BlindOffer[]>>(
    `/customer/marketplace/grades/${encodeURIComponent(id)}/offers${qs({ page, limit })}`,
  );
  return pagedFrom(
    res as Envelope<unknown[]>,
    (raw) => raw as BlindOffer,
    limit,
  );
}

/** Blind offer → card model; never carries seller identity into the UI. */
export function toGradeOffer(
  offer: BlindOffer,
  grade: GradeDirectoryItem,
  product?: MarketplaceProduct,
): MarketplaceOffer {
  const mapped = toMarketplaceOffer(offer, product);
  return {
    ...mapped,
    sellerName: "",
    categoryLabel: grade.category?.displayName ?? mapped.categoryLabel,
    grade: mapped.grade || grade.gradeNo || grade.code,
  };
}

export function isGradeNotFound(error: unknown): boolean {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  return status === 404 || status === 400;
}

export function gradeDirectoryErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    if (!error.response) {
      return "Unable to reach PetroTrade. Check your connection and try again.";
    }
    const message = error.response.data?.message;
    if (typeof message === "string" && message) return message;
    if (Array.isArray(message) && message[0]) return message[0];
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function fetchGradeFacets(
  query: GradeFacetQuery = {},
): Promise<GradeFacets> {
  const res = await apiClient.get<Envelope<Partial<GradeFacets>>>(
    `/master-data/grades/customer/facets${qs({
      category: query.category,
      categoryId: query.categoryId,
      search: query.search?.trim(),
    })}`,
  );
  const data = res.data ?? {};
  return {
    categories: data.categories ?? [],
    gradeGroups: data.gradeGroups ?? [],
    manufacturers: data.manufacturers ?? [],
  };
}
