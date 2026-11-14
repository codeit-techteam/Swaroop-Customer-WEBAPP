"use client";

import { create } from "zustand";
import {
  DEFAULT_MARKETPLACE_FILTERS,
  MARKETPLACE_PAGE_SIZE,
  PRICE_RANGE_BOUNDS,
} from "@/mock/filters";
import { fetchMarketplaceCatalog } from "@/services/catalog";
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
  hasLoaded: boolean;
  loadError: string | null;
  catalogTotal: number;
  priceBounds: typeof PRICE_RANGE_BOUNDS;

  fetchCatalog: (opts?: { force?: boolean }) => Promise<void>;

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

  const specs = product.technicalSpecs
    ? Object.values(product.technicalSpecs).filter(Boolean).join(" ")
    : "";

  const haystack = [
    product.name,
    product.grade,
    product.gradeCode,
    product.categoryId,
    product.materialType,
    product.subCategory,
    product.description,
    product.warehouseLabel,
    product.origin,
    product.casNumber,
    product.applications.join(" "),
    product.badge,
    specs,
    product.technicalSpecs?.mfi ? `${product.technicalSpecs.mfi} mfi` : "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

function priceBoundsFromProducts(
  products: MarketplaceProduct[],
): typeof PRICE_RANGE_BOUNDS {
  const prices = products
    .map((p) => p.price)
    .filter((p) => Number.isFinite(p) && p > 0);
  if (prices.length === 0) return PRICE_RANGE_BOUNDS;
  const min = Math.floor(Math.min(...prices));
  const max = Math.ceil(Math.max(...prices));
  // Keep a usable slider even when every listing shares one price.
  if (min >= max) {
    return {
      min: Math.max(0, min - PRICE_RANGE_BOUNDS.step),
      max: max + PRICE_RANGE_BOUNDS.step,
      step: PRICE_RANGE_BOUNDS.step,
    };
  }
  return { min, max, step: PRICE_RANGE_BOUNDS.step };
}

/** Price filter is inactive while the slider still spans the full observed range. */
function isPriceFilterActive(
  filters: MarketplaceFiltersState,
  bounds: typeof PRICE_RANGE_BOUNDS,
): boolean {
  return filters.priceMin > bounds.min || filters.priceMax < bounds.max;
}

function applyCatalogFilters(
  products: MarketplaceProduct[],
  filters: MarketplaceFiltersState,
  search: string,
  originFilter: GradeOriginFilter,
  selectedCategoryId: MarketplaceParentCategoryId | null,
  priceBounds: typeof PRICE_RANGE_BOUNDS,
): MarketplaceProduct[] {
  const priceActive = isPriceFilterActive(filters, priceBounds);
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

    // Only constrain price when the user narrowed the slider. RFQ / unpriced
    // rows stay visible until a real price bound is applied.
    if (priceActive) {
      if (!(product.price > 0)) return false;
      if (
        product.price < filters.priceMin ||
        product.price > filters.priceMax
      ) {
        return false;
      }
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
 * marketplaceStore — PostgreSQL-backed catalog via Swaroop-Backend.
 * Filter / search / sort remain client-side on the fetched page of records.
 */
export const useMarketplaceStore = create<MarketplaceStoreState>(
  (set, get) => ({
    products: [],
    categories: [],
    brands: [],
    warehouses: [],
    selectedCategoryId: null,
    filters: { ...DEFAULT_MARKETPLACE_FILTERS },
    draftFilters: { ...DEFAULT_MARKETPLACE_FILTERS },
    search: "",
    originFilter: "all",
    sortBy: "recommended",
    viewMode: "list",
    selectedWarehouse: null,
    creditEligible: false,
    page: 1,
    pageSize: MARKETPLACE_PAGE_SIZE,
    quickViewProductId: null,
    isLoading: false,
    hasLoaded: false,
    loadError: null,
    catalogTotal: 0,
    priceBounds: PRICE_RANGE_BOUNDS,

    fetchCatalog: async (opts) => {
      const current = get();
      // Prevent duplicate mounts / Strict Mode from stacking catalogue storms.
      if (current.isLoading) return;
      if (
        !opts?.force &&
        current.hasLoaded &&
        current.products.length > 0 &&
        !current.loadError
      ) {
        return;
      }
      set({ isLoading: true, loadError: null });
      try {
        const catalog = await fetchMarketplaceCatalog();
        const nextBounds = priceBoundsFromProducts(catalog.products);
        const state = get();
        // Keep a user-narrowed price filter; otherwise snap defaults to the
        // live catalogue range so Apply / Clear stay meaningful.
        const priceWasCustom = isPriceFilterActive(
          state.filters,
          state.priceBounds,
        );
        const nextPrice = priceWasCustom
          ? {
              priceMin: Math.max(
                nextBounds.min,
                Math.min(state.filters.priceMin, nextBounds.max),
              ),
              priceMax: Math.min(
                nextBounds.max,
                Math.max(state.filters.priceMax, nextBounds.min),
              ),
            }
          : { priceMin: nextBounds.min, priceMax: nextBounds.max };
        set({
          products: catalog.products,
          categories: catalog.categories,
          brands: catalog.brands,
          warehouses: catalog.warehouses,
          catalogTotal: catalog.total,
          priceBounds: nextBounds,
          filters: { ...state.filters, ...nextPrice },
          draftFilters: { ...state.draftFilters, ...nextPrice },
          isLoading: false,
          hasLoaded: true,
          loadError: null,
        });
      } catch (error) {
        set({
          products: [],
          categories: [],
          brands: [],
          warehouses: [],
          catalogTotal: 0,
          isLoading: false,
          hasLoaded: true,
          loadError:
            error instanceof Error
              ? error.message
              : "Unable to load marketplace catalog.",
        });
      }
    },

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
      set((state) => {
        const cleared = {
          ...DEFAULT_MARKETPLACE_FILTERS,
          priceMin: state.priceBounds.min,
          priceMax: state.priceBounds.max,
        };
        return {
          filters: cleared,
          draftFilters: cleared,
          selectedCategoryId: null,
          selectedWarehouse: null,
          creditEligible: false,
          originFilter: "all" as const,
          page: 1,
        };
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
        state.priceBounds,
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
