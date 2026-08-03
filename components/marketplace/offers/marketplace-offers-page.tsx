"use client";

import { useMemo, useState } from "react";
import { Filter, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
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
import { OfferSummaryCards } from "./offer-summary-cards";
import { OfferHeroBannerSlider } from "./offer-hero-banner";
import { OfferFilterPanel } from "./offer-filter-panel";
import { OfferCard } from "./offer-card";
import { LimitedTimeOffers } from "./limited-time-section";
import { RecommendedOffers } from "./recommended-offers";
import { CreditOffersSection } from "./credit-offers-section";
import { BulkDiscountSection } from "./bulk-discount-section";
import { PopularCampaigns } from "./popular-campaigns";
import { OffersRightSidebar } from "./offers-sidebar";
import { MarketplaceEmptyState } from "../empty-state";

export function MarketplaceOffersPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const search = useOffersStore((s) => s.search);
  const sortBy = useOffersStore((s) => s.sortBy);
  const draftFilters = useOffersStore((s) => s.draftFilters);
  const priceBounds = useOffersStore((s) => s.priceBounds);
  const offers = useOffersStore((s) => s.offers);
  const setSearch = useOffersStore((s) => s.setSearch);
  const setSortBy = useOffersStore((s) => s.setSortBy);
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
  const applyFilters = useOffersStore((s) => s.applyFilters);
  const resetFilters = useOffersStore((s) => s.resetFilters);
  const refreshOffers = useOffersStore((s) => s.refreshOffers);
  const getFilteredOffers = useOffersStore((s) => s.getFilteredOffers);
  const getSummaryStats = useOffersStore((s) => s.getSummaryStats);

  const filters = useOffersStore((s) => s.filters);
  const visibleOffers = useMemo(
    () => getFilteredOffers(),
    [getFilteredOffers, search, sortBy, filters, offers],
  );

  const stats = getSummaryStats();

  const filterPanelProps = {
    draftFilters,
    priceBounds,
    onToggleCategory: toggleDraftCategory,
    onToggleBrand: toggleDraftBrand,
    onWarehouseChange: setDraftWarehouse,
    onPriceChange: setDraftPriceRange,
    onTogglePaymentType: toggleDraftPaymentType,
    onToggleOfferType: toggleDraftOfferType,
    onCreditChange: setDraftCreditEligible,
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

  return (
    <PageContainer className="max-w-[1600px]">
      <PageHeader
        title="Marketplace Offers"
        description="Explore exclusive deals, bulk discounts, seasonal campaigns and credit offers."
        breadcrumbs={[
          { label: "Marketplace", href: ROUTES.marketplace },
          { label: "Offers" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative hidden min-w-[220px] sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search offers"
                className="h-10 rounded-xl border-slate-200 pl-9"
              />
            </div>

            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl lg:hidden">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full overflow-y-auto sm:max-w-md"
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
              <SelectTrigger className="h-10 w-[170px] rounded-xl">
                <SlidersHorizontal className="mr-1 h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {OFFER_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() => {
                refreshOffers();
                toast.success("Offers refreshed");
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="relative sm:hidden">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search offers"
          className="h-10 rounded-xl border-slate-200 pl-9"
        />
      </div>

      <OfferSummaryCards stats={stats} />
      <OfferHeroBannerSlider />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
        <div className="hidden xl:block">
          <OfferFilterPanel {...filterPanelProps} className="sticky top-24" />
        </div>

        <div className="min-w-0 space-y-6">
          <LimitedTimeOffers offers={offers} />

          <section id="offers-grid" className="scroll-mt-24">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  All Marketplace Offers
                </h2>
                <p className="text-sm text-slate-500">
                  Showing {visibleOffers.length} of {offers.length} offers
                </p>
              </div>
            </div>

            {visibleOffers.length === 0 ? (
              <MarketplaceEmptyState
                title="No offers match your filters"
                description="Clear filters or broaden your search to see more deals."
                onReset={resetFilters}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {visibleOffers.map((offer, index) => (
                  <OfferCard key={offer.id} offer={offer} index={index} />
                ))}
              </div>
            )}
          </section>

          <BulkDiscountSection offers={offers} />
          <PopularCampaigns />
          <CreditOffersSection />
          <RecommendedOffers />
        </div>

        <div className="hidden xl:block">
          <OffersRightSidebar className="sticky top-24" />
        </div>
      </div>

      <div className="xl:hidden">
        <OffersRightSidebar />
      </div>
    </PageContainer>
  );
}
