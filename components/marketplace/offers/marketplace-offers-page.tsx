"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROUTES } from "@/constants";
import { OFFER_SORT_OPTIONS } from "@/mock/offers";
import { useOffersStore } from "@/store/offersStore";
import type { OfferSortBy } from "@/types/offers";
import { FeaturedOffer } from "./featured-offer";
import { OfferCategoryChips } from "./offer-category-chips";
import { OfferFilterPanel } from "./offer-filter-panel";
import { OfferCard } from "./offer-card";
import { BulkVolumeDeals } from "./bulk-volume-deals";
import { PopularCampaigns } from "./popular-campaigns";
import { TrendingOffers } from "./trending-offers";
import { RecommendedOffers } from "./recommended-offers";
import { CreditOffersSection } from "./credit-offers-section";
import { OfferEmptyState } from "./offer-empty-state";
import { OffersPageSkeleton } from "./offers-page-skeleton";
import { MarketplaceEmptyState } from "@/components/marketplace/empty-state";
import { PromoBannerSlider } from "@/components/cms/promo-banner-slider";

export function MarketplaceOffersPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const search = useOffersStore((s) => s.search);
  const sortBy = useOffersStore((s) => s.sortBy);
  const categoryChip = useOffersStore((s) => s.categoryChip);
  const draftFilters = useOffersStore((s) => s.draftFilters);
  const priceBounds = useOffersStore((s) => s.priceBounds);
  const offers = useOffersStore((s) => s.offers);
  const isLoading = useOffersStore((s) => s.isLoading);
  const hasLoaded = useOffersStore((s) => s.hasLoaded);
  const loadError = useOffersStore((s) => s.loadError);
  const setSearch = useOffersStore((s) => s.setSearch);
  const setSortBy = useOffersStore((s) => s.setSortBy);
  const setCategoryChip = useOffersStore((s) => s.setCategoryChip);
  const toggleDraftCategory = useOffersStore((s) => s.toggleDraftCategory);
  const toggleDraftBrand = useOffersStore((s) => s.toggleDraftBrand);
  const setDraftWarehouse = useOffersStore((s) => s.setDraftWarehouse);
  const setDraftPriceRange = useOffersStore((s) => s.setDraftPriceRange);
  const toggleDraftPaymentType = useOffersStore(
    (s) => s.toggleDraftPaymentType,
  );
  const toggleDraftOfferType = useOffersStore((s) => s.toggleDraftOfferType);
  const setDraftCreditEligible = useOffersStore(
    (s) => s.setDraftCreditEligible,
  );
  const setDraftMinQuantity = useOffersStore((s) => s.setDraftMinQuantity);
  const setDraftMinDiscount = useOffersStore((s) => s.setDraftMinDiscount);
  const setDraftInStockOnly = useOffersStore((s) => s.setDraftInStockOnly);
  const applyFilters = useOffersStore((s) => s.applyFilters);
  const resetFilters = useOffersStore((s) => s.resetFilters);
  const getFilteredOffers = useOffersStore((s) => s.getFilteredOffers);
  const getSummaryStats = useOffersStore((s) => s.getSummaryStats);
  const fetchOffers = useOffersStore((s) => s.fetchOffers);

  useEffect(() => {
    void fetchOffers();
  }, [fetchOffers]);

  const filters = useOffersStore((s) => s.filters);
  const visibleOffers = useMemo(
    () => getFilteredOffers(),
    [getFilteredOffers, search, sortBy, filters, categoryChip, offers],
  );

  const stats = getSummaryStats();
  const featuredOffer =
    offers.find((o) => o.id === "offer-pp-week") ?? offers[0];

  const filterPanelProps = {
    draftFilters,
    priceBounds,
    resultCount: visibleOffers.length,
    onToggleCategory: toggleDraftCategory,
    onToggleBrand: toggleDraftBrand,
    onWarehouseChange: setDraftWarehouse,
    onPriceChange: setDraftPriceRange,
    onTogglePaymentType: toggleDraftPaymentType,
    onToggleOfferType: toggleDraftOfferType,
    onCreditChange: setDraftCreditEligible,
    onMinQuantityChange: setDraftMinQuantity,
    onMinDiscountChange: setDraftMinDiscount,
    onInStockChange: setDraftInStockOnly,
    onApply: () => {
      applyFilters();
      setMobileFiltersOpen(false);
      toast.success("Filters applied");
    },
    onReset: () => {
      resetFilters();
      toast.message("Filters cleared");
    },
  };

  if (!hasLoaded || isLoading) {
    return (
      <PageContainer className="max-w-[1440px]">
        <OffersPageSkeleton />
      </PageContainer>
    );
  }

  if (loadError) {
    return (
      <PageContainer className="max-w-[1440px]">
        <MarketplaceEmptyState
          title="Unable to load offers"
          description={loadError}
          action={
            <Button onClick={() => void fetchOffers()}>Retry</Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-[1440px]">
      {/* Page header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav className="mb-1 text-sm text-slate-500">
            <Link href={ROUTES.marketplace} className="hover:text-brand">
              Marketplace
            </Link>
            <span className="mx-2">›</span>
            <span className="text-slate-700">Offers</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900">
            Offers & Bulk Deals
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Save more on eligible polymers, chemicals and industrial materials.
          </p>
          <p className="mt-2 text-xs font-medium text-brand">
            {stats.activeOffers} Active Offers
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="h-10 rounded-xl">
            <Link href={ROUTES.marketplaceMyOffers}>My Offers</Link>
          </Button>
          <Button
            asChild
            className="h-10 rounded-xl bg-brand hover:bg-brand-700"
          >
            <Link href={ROUTES.marketplace}>View Marketplace</Link>
          </Button>
        </div>
      </header>

      <PromoBannerSlider placement="OFFERS" className="mb-6" />

      {featuredOffer ? (
        <FeaturedOffer offer={featuredOffer} className="mb-6" />
      ) : null}

      <OfferCategoryChips
        active={categoryChip}
        onChange={setCategoryChip}
        className="mb-6"
      />

      <div className="mb-5 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search offers, products, brands..."
              className="h-11 rounded-xl border-slate-200 bg-slate-50/70 pl-9 focus-visible:bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-11 rounded-xl lg:hidden">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full overflow-y-auto sm:max-w-sm"
              >
                <SheetHeader>
                  <SheetTitle>Offer Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <OfferFilterPanel {...filterPanelProps} />
                </div>
              </SheetContent>
            </Sheet>

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as OfferSortBy)}
            >
              <SelectTrigger className="h-11 min-w-0 flex-1 rounded-xl sm:w-[190px] sm:flex-none">
                <SlidersHorizontal className="mr-1 h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {OFFER_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <OfferFilterPanel
            {...filterPanelProps}
            className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
          />
        </div>

        <div className="min-w-0 space-y-8">
          <section id="offers-grid" className="scroll-mt-24">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Available Product Offers
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Compare pricing, stock and payment terms at a glance.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
                {visibleOffers.length} offer
                {visibleOffers.length !== 1 ? "s" : ""}
              </span>
            </div>

            {visibleOffers.length === 0 ? (
              <OfferEmptyState
                variant={offers.length === 0 ? "no-active" : "no-results"}
                onClearFilters={
                  offers.length === 0 ? undefined : resetFilters
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {visibleOffers.map((offer, index) => (
                  <OfferCard key={offer.id} offer={offer} index={index} />
                ))}
              </div>
            )}
          </section>

          <BulkVolumeDeals offers={offers} />
          <PopularCampaigns />
          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <RecommendedOffers />
            <TrendingOffers offers={offers} />
          </div>
          <CreditOffersSection />
        </div>
      </div>
    </PageContainer>
  );
}
