"use client";

import { create } from "zustand";
import { marketplaceMock } from "@/mock/marketplace";
import {
  DEFAULT_MARKETPLACE_FILTERS,
  MARKETPLACE_PAGE_SIZE,
  PRICE_RANGE_BOUNDS,
} from "@/mock/filters";
import type {
  GradeOriginFilter,
  MarketplaceBrand,
  MarketplaceCategory,
  MarketplaceFiltersState,
  MarketplaceParentCategoryId,
  MarketplaceProduct,
  MarketplaceSortBy,
  MarketplaceViewMode,
  MarketplaceWarehouse,
} from "@/types/marketplace";
import { getProductSupplyOrigin } from "@/lib/grade-search";

export type { MarketplaceViewMode, MarketplaceSortBy };

export interface MarketplaceStoreState {
  products: MarketplaceProduct[];
  categories: MarketplaceCategory[];
  brands: MarketplaceBrand[];
  warehouses: MarketplaceWarehouse[];
  selectedCategoryId: MarketplaceParentCategoryId | null;
  filters: MarketplaceFiltersState;
  draftFilters: MarketplaceFiltersState;
  search: string;
  originFilter: GradeOriginFilter;
  sortBy: MarketplaceSortBy;
  viewMode: MarketplaceViewMode;
  selectedWarehouse: string | null;
  creditEligible: boolean;
  page: number;
  pageSize: number;
  quickViewProductId: string | null;
  isLoading: boolean;
  priceBounds: typeof PRICE_RANGE_BOUNDS;

  setSearch: (search: string) => void;
  setOriginFilter: (origin: GradeOriginFilter) => void;
  setSortBy: (sortBy: MarketplaceSortBy) => void;
  setViewMode: (viewMode: MarketplaceViewMode) => void;
  setPage: (page: number) => void;
  setSelectedCategory: (categoryId: MarketplaceParentCategoryId | null) => void;
  toggleDraftCategory: (categoryId: MarketplaceParentCategoryId) => void;
  toggleDraftBrand: (brandId: string) => void;
  setDraftPriceRange: (min: number, max: number) => void;
  setDraftWarehouse: (warehouseId: string | null) => void;
  setDraftCreditEligible: (enabled: boolean) => void;
  applyFilters: () => void;
  applyCategoryFilter: (categoryId: MarketplaceParentCategoryId | null) => void;
  resetFilters: () => void;
  hydrateCategorySlug: (slug: string | null) => void;
  openQuickView: (productId: string) => void;
  closeQuickView: () => void;
  setLoading: (loading: boolean) => void;
  getFilteredProducts: () => MarketplaceProduct[];
  getPaginatedProducts: () => {
    items: MarketplaceProduct[];
    total: number;
    totalPages: number;
    from: number;
    to: number;
  };
}

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function matchesSearch(product: MarketplaceProduct, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    product.name,
    product.grade,
    product.categoryId,
    product.materialType,
    product.brandName,
    product.brandShortName,
    product.description,
    product.warehouseLabel,
    product.origin,
    product.casNumber,
    product.applications.join(" "),
    product.badge,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

function applyCatalogFilters(
  products: MarketplaceProduct[],
  filters: MarketplaceFiltersState,
  search: string,
  originFilter: GradeOriginFilter,
  selectedCategoryId: MarketplaceParentCategoryId | null,
): MarketplaceProduct[] {
  return products.filter((product) => {
    if (!matchesSearch(product, search)) return false;

    if (
      originFilter !== "all" &&
      getProductSupplyOrigin(product) !== originFilter
    ) {
      return false;
    }

    if (selectedCategoryId && product.categoryId !== selectedCategoryId) {
      return false;
    }

    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.categoryId)
    ) {
      return false;
    }

    if (
      filters.brands.length > 0 &&
      !filters.brands.includes(product.brandId)
    ) {
      return false;
    }

    if (product.price < filters.priceMin || product.price > filters.priceMax) {
      return false;
    }

    if (
      filters.warehouseId &&
      filters.warehouseId !== "wh-all" &&
      product.warehouseId !== filters.warehouseId
    ) {
      return false;
    }

    if (filters.creditEligibleOnly && !product.creditEligible) {
      return false;
    }

    return true;
  });
}

function sortProducts(
  products: MarketplaceProduct[],
  sortBy: MarketplaceSortBy,
): MarketplaceProduct[] {
  const sorted = [...products];

  switch (sortBy) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "popular":
      return sorted.sort((a, b) => b.popularityScore - a.popularityScore);
    case "recommended":
    default:
      return sorted.sort((a, b) => b.popularityScore - a.popularityScore);
  }
}

/**
 * marketplaceStore — mock-backed catalog state for desktop Marketplace.
 * Filter / search / sort are client-only; ready for API hydration.
 */
export const useMarketplaceStore = create<MarketplaceStoreState>(
  (set, get) => ({
    products: marketplaceMock.products,
    categories: marketplaceMock.categories,
    brands: marketplaceMock.brands,
    warehouses: marketplaceMock.warehouses,
    selectedCategoryId: null,
    filters: { ...DEFAULT_MARKETPLACE_FILTERS },
    draftFilters: { ...DEFAULT_MARKETPLACE_FILTERS },
    search: "",
    originFilter: "all",
    sortBy: "recommended",
    viewMode: "grid",
    selectedWarehouse: null,
    creditEligible: false,
    page: 1,
    pageSize: MARKETPLACE_PAGE_SIZE,
    quickViewProductId: null,
    isLoading: false,
    priceBounds: PRICE_RANGE_BOUNDS,

    setSearch: (search) => set({ search, page: 1 }),
    setOriginFilter: (originFilter) => set({ originFilter, page: 1 }),
    setSortBy: (sortBy) => set({ sortBy, page: 1 }),
    setViewMode: (viewMode) => set({ viewMode }),
    setPage: (page) => set({ page }),

    setSelectedCategory: (categoryId) =>
      set({
        selectedCategoryId: categoryId,
        page: 1,
        draftFilters: {
          ...get().draftFilters,
          categories: categoryId ? [categoryId] : [],
        },
        filters: {
          ...get().filters,
          categories: categoryId ? [categoryId] : [],
        },
      }),

    toggleDraftCategory: (categoryId) =>
      set((state) => ({
        draftFilters: {
          ...state.draftFilters,
          categories: toggleInList(state.draftFilters.categories, categoryId),
        },
      })),

    toggleDraftBrand: (brandId) =>
      set((state) => ({
        draftFilters: {
          ...state.draftFilters,
          brands: toggleInList(state.draftFilters.brands, brandId),
        },
      })),

    setDraftPriceRange: (min, max) =>
      set((state) => ({
        draftFilters: {
          ...state.draftFilters,
          priceMin: min,
          priceMax: max,
        },
      })),

    setDraftWarehouse: (warehouseId) =>
      set((state) => ({
        draftFilters: {
          ...state.draftFilters,
          warehouseId,
        },
        selectedWarehouse: warehouseId,
      })),

    setDraftCreditEligible: (enabled) =>
      set((state) => ({
        draftFilters: {
          ...state.draftFilters,
          creditEligibleOnly: enabled,
        },
        creditEligible: enabled,
      })),

    applyFilters: () =>
      set((state) => ({
        filters: { ...state.draftFilters },
        selectedCategoryId:
          state.draftFilters.categories.length === 1
            ? state.draftFilters.categories[0]!
            : state.draftFilters.categories.length === 0
              ? null
              : state.selectedCategoryId,
        selectedWarehouse: state.draftFilters.warehouseId,
        creditEligible: state.draftFilters.creditEligibleOnly,
        page: 1,
      })),

    applyCategoryFilter: (categoryId) => {
      const categories = categoryId ? [categoryId] : [];
      set((state) => {
        const nextFilters = {
          ...state.draftFilters,
          categories,
        };
        return {
          draftFilters: nextFilters,
          filters: nextFilters,
          selectedCategoryId: categoryId,
          page: 1,
        };
      });
    },

    resetFilters: () =>
      set({
        filters: { ...DEFAULT_MARKETPLACE_FILTERS },
        draftFilters: { ...DEFAULT_MARKETPLACE_FILTERS },
        selectedCategoryId: null,
        selectedWarehouse: null,
        creditEligible: false,
        originFilter: "all",
        page: 1,
      }),

    hydrateCategorySlug: (slug) => {
      if (!slug) {
        get().setSelectedCategory(null);
        return;
      }
      const category = get().categories.find((item) => item.slug === slug);
      get().setSelectedCategory(category?.id ?? null);
    },

    openQuickView: (productId) => set({ quickViewProductId: productId }),
    closeQuickView: () => set({ quickViewProductId: null }),
    setLoading: (loading) => set({ isLoading: loading }),

    getFilteredProducts: () => {
      const state = get();
      const filtered = applyCatalogFilters(
        state.products,
        state.filters,
        state.search,
        state.originFilter,
        // When filters already include categories, selectedCategoryId is reflected there
        state.filters.categories.length > 0 ? null : state.selectedCategoryId,
      );
      return sortProducts(filtered, state.sortBy);
    },

    getPaginatedProducts: () => {
      const state = get();
      const filtered = state.getFilteredProducts();
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
      const page = Math.min(state.page, totalPages);
      const start = (page - 1) * state.pageSize;
      const items = filtered.slice(start, start + state.pageSize);
      const from = total === 0 ? 0 : start + 1;
      const to = Math.min(start + state.pageSize, total);

      return { items, total, totalPages, from, to };
    },
  }),
);
