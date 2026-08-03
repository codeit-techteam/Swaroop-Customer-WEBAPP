"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_OFFER_FILTERS,
  OFFER_PRICE_BOUNDS,
  getOfferById,
  getOfferSummaryStats,
  offersCatalogMock,
} from "@/mock/offers";
import type {
  MarketplaceOffer,
  OfferFiltersState,
  OfferSortBy,
  OfferSummaryStats,
} from "@/types/offers";
import type { MarketplaceParentCategoryId } from "@/types/marketplace";

interface OffersStoreState {
  offers: MarketplaceOffer[];
  filters: OfferFiltersState;
  draftFilters: OfferFiltersState;
  search: string;
  sortBy: OfferSortBy;
  wishlistIds: string[];
  compareIds: string[];
  recentlyViewedIds: string[];
  priceBounds: typeof OFFER_PRICE_BOUNDS;

  setSearch: (search: string) => void;
  setSortBy: (sortBy: OfferSortBy) => void;
  toggleDraftCategory: (id: MarketplaceParentCategoryId) => void;
  toggleDraftBrand: (id: string) => void;
  setDraftWarehouse: (id: string | null) => void;
  setDraftPriceRange: (min: number, max: number) => void;
  toggleDraftPaymentType: (
    id: OfferFiltersState["paymentTypes"][number],
  ) => void;
  toggleDraftOfferType: (id: OfferFiltersState["offerTypes"][number]) => void;
  setDraftCreditEligible: (enabled: boolean) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  applyCampaignType: (
    offerType: OfferFiltersState["offerTypes"][number],
  ) => void;
  toggleWishlist: (offerId: string) => void;
  toggleCompare: (offerId: string) => void;
  markViewed: (offerId: string) => void;
  refreshOffers: () => void;
  getFilteredOffers: () => MarketplaceOffer[];
  getSummaryStats: () => OfferSummaryStats;
  getOffer: (id: string) => MarketplaceOffer | undefined;
}

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function matchesSearch(offer: MarketplaceOffer, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    offer.title,
    offer.productName,
    offer.grade,
    offer.brandName,
    offer.categoryLabel,
    offer.warehouseLabel,
    offer.badge,
    offer.offerType,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function sortOffers(offers: MarketplaceOffer[], sortBy: OfferSortBy) {
  const sorted = [...offers];
  switch (sortBy) {
    case "discount_desc":
      return sorted.sort((a, b) => b.discountPercent - a.discountPercent);
    case "price_asc":
      return sorted.sort((a, b) => a.offerPrice - b.offerPrice);
    case "price_desc":
      return sorted.sort((a, b) => b.offerPrice - a.offerPrice);
    case "ending_soon":
      return sorted.sort(
        (a, b) =>
          new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
      );
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "recommended":
    default:
      return sorted.sort((a, b) => {
        const score = (o: MarketplaceOffer) =>
          (o.isTrending ? 40 : 0) +
          (o.isMostRequested ? 30 : 0) +
          o.discountPercent +
          o.requestCount / 10;
        return score(b) - score(a);
      });
  }
}

export const useOffersStore = create<OffersStoreState>()(
  persist(
    (set, get) => ({
      offers: offersCatalogMock.offers,
      filters: { ...DEFAULT_OFFER_FILTERS },
      draftFilters: { ...DEFAULT_OFFER_FILTERS },
      search: "",
      sortBy: "recommended",
      wishlistIds: [],
      compareIds: [],
      recentlyViewedIds: [
        "offer-pp-week",
        "offer-hdpe-festival",
        "offer-pet-flash",
      ],
      priceBounds: OFFER_PRICE_BOUNDS,

      setSearch: (search) => set({ search }),
      setSortBy: (sortBy) => set({ sortBy }),

      toggleDraftCategory: (id) =>
        set((state) => ({
          draftFilters: {
            ...state.draftFilters,
            categories: toggleInList(state.draftFilters.categories, id),
          },
        })),

      toggleDraftBrand: (id) =>
        set((state) => ({
          draftFilters: {
            ...state.draftFilters,
            brands: toggleInList(state.draftFilters.brands, id),
          },
        })),

      setDraftWarehouse: (id) =>
        set((state) => ({
          draftFilters: { ...state.draftFilters, warehouseId: id },
        })),

      setDraftPriceRange: (min, max) =>
        set((state) => ({
          draftFilters: {
            ...state.draftFilters,
            priceMin: min,
            priceMax: max,
          },
        })),

      toggleDraftPaymentType: (id) =>
        set((state) => ({
          draftFilters: {
            ...state.draftFilters,
            paymentTypes: toggleInList(state.draftFilters.paymentTypes, id),
          },
        })),

      toggleDraftOfferType: (id) =>
        set((state) => ({
          draftFilters: {
            ...state.draftFilters,
            offerTypes: toggleInList(state.draftFilters.offerTypes, id),
          },
        })),

      setDraftCreditEligible: (enabled) =>
        set((state) => ({
          draftFilters: {
            ...state.draftFilters,
            creditEligibleOnly: enabled,
          },
        })),

      applyFilters: () =>
        set((state) => ({
          filters: { ...state.draftFilters },
        })),

      resetFilters: () =>
        set({
          filters: { ...DEFAULT_OFFER_FILTERS },
          draftFilters: { ...DEFAULT_OFFER_FILTERS },
          search: "",
        }),

      applyCampaignType: (offerType) =>
        set({
          filters: {
            ...DEFAULT_OFFER_FILTERS,
            offerTypes: [offerType],
          },
          draftFilters: {
            ...DEFAULT_OFFER_FILTERS,
            offerTypes: [offerType],
          },
        }),

      toggleWishlist: (offerId) =>
        set((state) => ({
          wishlistIds: toggleInList(state.wishlistIds, offerId),
        })),

      toggleCompare: (offerId) =>
        set((state) => {
          const exists = state.compareIds.includes(offerId);
          if (exists) {
            return {
              compareIds: state.compareIds.filter((id) => id !== offerId),
            };
          }
          if (state.compareIds.length >= 3) {
            return { compareIds: [...state.compareIds.slice(1), offerId] };
          }
          return { compareIds: [...state.compareIds, offerId] };
        }),

      markViewed: (offerId) =>
        set((state) => {
          const next = [
            offerId,
            ...state.recentlyViewedIds.filter((id) => id !== offerId),
          ].slice(0, 8);
          return { recentlyViewedIds: next };
        }),

      refreshOffers: () =>
        set({
          offers: offersCatalogMock.offers,
        }),

      getFilteredOffers: () => {
        const { offers, filters, search, sortBy } = get();
        const filtered = offers.filter((offer) => {
          if (!matchesSearch(offer, search)) return false;
          if (
            filters.categories.length &&
            !filters.categories.includes(offer.categoryId)
          ) {
            return false;
          }
          if (
            filters.brands.length &&
            !filters.brands.includes(offer.brandId)
          ) {
            return false;
          }
          if (
            filters.warehouseId &&
            offer.warehouseId !== filters.warehouseId
          ) {
            return false;
          }
          if (
            offer.offerPrice < filters.priceMin ||
            offer.offerPrice > filters.priceMax
          ) {
            return false;
          }
          if (
            filters.paymentTypes.length &&
            !filters.paymentTypes.some((p) => offer.paymentTypes.includes(p))
          ) {
            return false;
          }
          if (
            filters.offerTypes.length &&
            !filters.offerTypes.includes(offer.offerType)
          ) {
            return false;
          }
          if (filters.creditEligibleOnly && !offer.creditEligible) {
            return false;
          }
          return true;
        });
        return sortOffers(filtered, sortBy);
      },

      getSummaryStats: () => getOfferSummaryStats(get().offers),

      getOffer: (id) =>
        getOfferById(id) ?? get().offers.find((o) => o.id === id),
    }),
    {
      name: "swaroop-marketplace-offers",
      partialize: (state) => ({
        wishlistIds: state.wishlistIds,
        compareIds: state.compareIds,
        recentlyViewedIds: state.recentlyViewedIds,
      }),
    },
  ),
);
