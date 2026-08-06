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
import { getOfferStatus } from "@/lib/offer-utils";
import type {
  MarketplaceOffer,
  MyOfferRecord,
  MyOfferTab,
  OfferCategoryChip,
  OfferFiltersState,
  OfferSortBy,
  OfferSummaryStats,
} from "@/types/offers";
import type { MarketplaceParentCategoryId } from "@/types/marketplace";

interface OffersStoreState {
  offers: MarketplaceOffer[];
  filters: OfferFiltersState;
  draftFilters: OfferFiltersState;
  categoryChip: OfferCategoryChip;
  search: string;
  sortBy: OfferSortBy;
  compareIds: string[];
  recentlyViewedIds: string[];
  myOfferRecords: MyOfferRecord[];
  priceBounds: typeof OFFER_PRICE_BOUNDS;

  setSearch: (search: string) => void;
  setSortBy: (sortBy: OfferSortBy) => void;
  setCategoryChip: (chip: OfferCategoryChip) => void;
  toggleDraftCategory: (id: MarketplaceParentCategoryId) => void;
  toggleDraftBrand: (id: string) => void;
  setDraftWarehouse: (id: string | null) => void;
  setDraftPriceRange: (min: number, max: number) => void;
  toggleDraftPaymentType: (
    id: OfferFiltersState["paymentTypes"][number],
  ) => void;
  toggleDraftOfferType: (id: OfferFiltersState["offerTypes"][number]) => void;
  setDraftCreditEligible: (enabled: boolean) => void;
  setDraftMinQuantity: (qty: number | null) => void;
  setDraftMinDiscount: (percent: number | null) => void;
  setDraftInStockOnly: (enabled: boolean) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  applyCampaignType: (
    offerType: OfferFiltersState["offerTypes"][number],
  ) => void;
  toggleCompare: (offerId: string) => void;
  markViewed: (offerId: string) => void;
  markOfferApplied: (offerId: string) => void;
  refreshOffers: () => void;
  getFilteredOffers: () => MarketplaceOffer[];
  getSummaryStats: () => OfferSummaryStats;
  getOffer: (id: string) => MarketplaceOffer | undefined;
  getMyOffers: (tab: MyOfferTab) => MyOfferRecord[];
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

function matchesCategoryChip(
  offer: MarketplaceOffer,
  chip: OfferCategoryChip,
): boolean {
  switch (chip) {
    case "all":
      return true;
    case "bulk_deals":
      return (
        offer.offerType === "bulk_discount" || Boolean(offer.bulkTiers?.length)
      );
    case "limited_time":
      return offer.isLimitedTime || offer.offerType === "flash_sale";
    case "credit_eligible":
      return offer.creditEligible;
    case "polymers":
    case "chemicals":
    case "additives":
    case "base-oils":
      return offer.categoryId === chip;
    default:
      return true;
  }
}

function sortOffers(offers: MarketplaceOffer[], sortBy: OfferSortBy) {
  const sorted = [...offers];
  switch (sortBy) {
    case "discount_desc":
      return sorted.sort((a, b) => b.discountPercent - a.discountPercent);
    case "price_asc":
      return sorted.sort((a, b) => a.offerPrice - b.offerPrice);
    case "savings_desc":
      return sorted.sort((a, b) => b.savings - a.savings);
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

function applyOfferFilters(
  offer: MarketplaceOffer,
  filters: OfferFiltersState,
  search: string,
  categoryChip: OfferCategoryChip,
): boolean {
  if (!matchesSearch(offer, search)) return false;
  if (!matchesCategoryChip(offer, categoryChip)) return false;
  if (
    filters.categories.length &&
    !filters.categories.includes(offer.categoryId)
  ) {
    return false;
  }
  if (filters.brands.length && !filters.brands.includes(offer.brandId)) {
    return false;
  }
  if (filters.warehouseId && offer.warehouseId !== filters.warehouseId) {
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
  if (filters.minQuantity != null && offer.moq > filters.minQuantity) {
    return false;
  }
  if (
    filters.minDiscountPercent != null &&
    offer.discountPercent < filters.minDiscountPercent
  ) {
    return false;
  }
  if (filters.inStockOnly && offer.remainingStock <= 0) {
    return false;
  }
  return true;
}

export const useOffersStore = create<OffersStoreState>()(
  persist(
    (set, get) => ({
      offers: offersCatalogMock.offers,
      filters: { ...DEFAULT_OFFER_FILTERS },
      draftFilters: { ...DEFAULT_OFFER_FILTERS },
      categoryChip: "all",
      search: "",
      sortBy: "recommended",
      compareIds: [],
      recentlyViewedIds: [
        "offer-pp-week",
        "offer-hdpe-festival",
        "offer-pet-flash",
      ],
      myOfferRecords: [
        {
          offerId: "offer-pp-week",
          status: "applied",
          appliedAt: "2026-08-01T10:00:00.000Z",
        },
        {
          offerId: "offer-hdpe-festival",
          status: "used",
          usedAt: "2026-07-20T14:00:00.000Z",
        },
        { offerId: "offer-pet-flash", status: "available" },
        { offerId: "offer-pvc-mega", status: "expired" },
      ],
      priceBounds: OFFER_PRICE_BOUNDS,

      setSearch: (search) => set({ search }),
      setSortBy: (sortBy) => set({ sortBy }),
      setCategoryChip: (categoryChip) => set({ categoryChip }),

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

      setDraftMinQuantity: (minQuantity) =>
        set((state) => ({
          draftFilters: { ...state.draftFilters, minQuantity },
        })),

      setDraftMinDiscount: (minDiscountPercent) =>
        set((state) => ({
          draftFilters: { ...state.draftFilters, minDiscountPercent },
        })),

      setDraftInStockOnly: (inStockOnly) =>
        set((state) => ({
          draftFilters: { ...state.draftFilters, inStockOnly },
        })),

      applyFilters: () =>
        set((state) => ({
          filters: { ...state.draftFilters },
        })),

      resetFilters: () =>
        set({
          filters: { ...DEFAULT_OFFER_FILTERS },
          draftFilters: { ...DEFAULT_OFFER_FILTERS },
          categoryChip: "all",
          search: "",
        }),

      applyCampaignType: (offerType) =>
        set({
          categoryChip: "all",
          filters: {
            ...DEFAULT_OFFER_FILTERS,
            offerTypes: [offerType],
          },
          draftFilters: {
            ...DEFAULT_OFFER_FILTERS,
            offerTypes: [offerType],
          },
        }),

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

      markOfferApplied: (offerId) =>
        set((state) => {
          const existing = state.myOfferRecords.find(
            (r) => r.offerId === offerId,
          );
          if (existing) {
            return {
              myOfferRecords: state.myOfferRecords.map((r) =>
                r.offerId === offerId
                  ? {
                      ...r,
                      status: "applied" as const,
                      appliedAt: new Date().toISOString(),
                    }
                  : r,
              ),
            };
          }
          return {
            myOfferRecords: [
              ...state.myOfferRecords,
              {
                offerId,
                status: "applied" as const,
                appliedAt: new Date().toISOString(),
              },
            ],
          };
        }),

      refreshOffers: () =>
        set({
          offers: offersCatalogMock.offers,
        }),

      getFilteredOffers: () => {
        const { offers, filters, search, sortBy, categoryChip } = get();
        const filtered = offers.filter((offer) =>
          applyOfferFilters(offer, filters, search, categoryChip),
        );
        return sortOffers(filtered, sortBy);
      },

      getSummaryStats: () => {
        const active = get().offers.filter(
          (o) =>
            getOfferStatus(o) === "active" ||
            getOfferStatus(o) === "ending_soon",
        );
        return getOfferSummaryStats(active);
      },

      getOffer: (id) =>
        getOfferById(id) ?? get().offers.find((o) => o.id === id),

      getMyOffers: (tab) => {
        const records = get().myOfferRecords;
        return records.filter((record) => {
          const offer = getOfferById(record.offerId);
          if (!offer) return false;
          const liveStatus = getOfferStatus(offer);
          switch (tab) {
            case "available":
              return (
                record.status === "available" &&
                (liveStatus === "active" || liveStatus === "ending_soon")
              );
            case "applied":
              return record.status === "applied";
            case "used":
              return record.status === "used";
            case "expired":
              return record.status === "expired" || liveStatus === "expired";
            default:
              return true;
          }
        });
      },
    }),
    {
      name: "swaroop-marketplace-offers",
      partialize: (state) => ({
        compareIds: state.compareIds,
        recentlyViewedIds: state.recentlyViewedIds,
        myOfferRecords: state.myOfferRecords,
      }),
    },
  ),
);
