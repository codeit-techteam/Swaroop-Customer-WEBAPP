"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/constants";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import { FilterTopBar } from "./filter-top-bar";
import { MarketplaceHeader } from "./marketplace-header";
import { MarketplaceSearchBar } from "./search-bar";
import { MarketplaceCategoryChips } from "./marketplace-category-chips";
import { MaterialChips } from "./material-chips";
import { OfferBanner } from "./offer-banner";
import { SortDropdown } from "./sort-dropdown";
import { ViewToggle } from "./view-toggle";
import { ProductGrid } from "./product-grid";
import { ProductList } from "./product-list";
import { MarketplaceEmptyState } from "./empty-state";
import { MarketplacePagination } from "./pagination";
import { QuickViewDrawer } from "./quick-view-drawer";
import { MarketplaceBrowseSkeleton } from "./marketplace-skeleton";
import { MARKETPLACE_SEARCH_PLACEHOLDER } from "@/mock/filters";
import type { GradeOriginFilter } from "@/types/marketplace";
import type { MarketplaceOffer } from "@/types/offers";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BlindSellerBadge } from "./blind-seller-badge";
import { CompareTray } from "./compare-tray";
import { ArrowLeft, GitCompareArrows } from "lucide-react";
import { useCompareStore } from "@/store/compareStore";
import { Button } from "@/components/ui/button";

const ORIGIN_FILTERS: Array<{ value: GradeOriginFilter; label: string }> = [
  { value: "all", label: "All Origins" },
  { value: "domestic", label: "Domestic" },
  { value: "imported", label: "Imported" },
];

interface MarketplaceBrowseProps {
  initialCategorySlug?: string | null;
  pageTitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function MarketplaceBrowse({
  initialCategorySlug = null,
  pageTitle = "Marketplace",
  breadcrumbs,
}: MarketplaceBrowseProps) {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [activeOfferId, setActiveOfferId] = useState<string | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<string | null>(null);

  const categories = useMarketplaceStore((s) => s.categories);
  const warehouses = useMarketplaceStore((s) => s.warehouses);
  const draftFilters = useMarketplaceStore((s) => s.draftFilters);
  const filters = useMarketplaceStore((s) => s.filters);
  const priceBounds = useMarketplaceStore((s) => s.priceBounds);
  const search = useMarketplaceStore((s) => s.search);
  const originFilter = useMarketplaceStore((s) => s.originFilter);
  const sortBy = useMarketplaceStore((s) => s.sortBy);
  const viewMode = useMarketplaceStore((s) => s.viewMode);
  const page = useMarketplaceStore((s) => s.page);
  const quickViewProductId = useMarketplaceStore((s) => s.quickViewProductId);
  const products = useMarketplaceStore((s) => s.products);
  const selectedCategoryId = useMarketplaceStore((s) => s.selectedCategoryId);

  const setSearch = useMarketplaceStore((s) => s.setSearch);
  const setOriginFilter = useMarketplaceStore((s) => s.setOriginFilter);
  const setSortBy = useMarketplaceStore((s) => s.setSortBy);
  const setViewMode = useMarketplaceStore((s) => s.setViewMode);
  const setPage = useMarketplaceStore((s) => s.setPage);
  const toggleDraftBrand = useMarketplaceStore((s) => s.toggleDraftBrand);
  const setDraftPriceRange = useMarketplaceStore((s) => s.setDraftPriceRange);
  const setDraftWarehouse = useMarketplaceStore((s) => s.setDraftWarehouse);
  const setDraftCreditEligible = useMarketplaceStore(
    (s) => s.setDraftCreditEligible,
  );
  const applyFilters = useMarketplaceStore((s) => s.applyFilters);
  const applyCategoryFilter = useMarketplaceStore((s) => s.applyCategoryFilter);
  const resetFilters = useMarketplaceStore((s) => s.resetFilters);
  const hydrateCategorySlug = useMarketplaceStore((s) => s.hydrateCategorySlug);
  const openQuickView = useMarketplaceStore((s) => s.openQuickView);
  const closeQuickView = useMarketplaceStore((s) => s.closeQuickView);
  const getPaginatedProducts = useMarketplaceStore(
    (s) => s.getPaginatedProducts,
  );

  useEffect(() => {
    hydrateCategorySlug(initialCategorySlug);
    const timer = window.setTimeout(() => setReady(true), 280);
    return () => window.clearTimeout(timer);
  }, [hydrateCategorySlug, initialCategorySlug]);

  useEffect(() => {
    const q = searchParams.get("search");
    const origin = searchParams.get("origin");
    if (q) setSearch(q);
    if (origin === "domestic" || origin === "imported") {
      setOriginFilter(origin);
    } else if (origin === "all") {
      setOriginFilter("all");
    }
  }, [searchParams, setSearch, setOriginFilter]);

  const pagination = getPaginatedProducts();
  const compareMode = searchParams.get("compare") === "1";
  const compareCount = useCompareStore((s) => s.ids.length);

  const activeCategoryId = useMemo(() => {
    if (selectedCategoryId) return selectedCategoryId;
    if (filters.categories.length === 1) return filters.categories[0]!;
    return null;
  }, [filters.categories, selectedCategoryId]);

  const headingTitle = useMemo(() => {
    if (activeCategoryId) {
      const category = categories.find((item) => item.id === activeCategoryId);
      return category?.name ?? pageTitle;
    }
    return "All Materials";
  }, [activeCategoryId, categories, pageTitle]);

  const quickViewProduct = useMemo(
    () => products.find((product) => product.id === quickViewProductId) ?? null,
    [products, quickViewProductId],
  );

  const crumbItems = breadcrumbs ?? [
    { label: "Marketplace", href: ROUTES.marketplace },
    { label: headingTitle },
  ];

  const handleApply = () => {
    applyFilters();
    toast.success("Filters applied");
  };

  const handleSelectCategory = (
    categoryId: Parameters<typeof applyCategoryFilter>[0],
  ) => {
    setActiveOfferId(null);
    applyCategoryFilter(categoryId);
  };

  const handleReset = () => {
    setActiveOfferId(null);
    resetFilters();
  };

  const handleViewOfferProducts = (offer: MarketplaceOffer) => {
    setActiveOfferId(offer.id);
    applyCategoryFilter(offer.categoryId);
    toast.success(`Showing products for ${offer.title}`);
  };

  if (!ready) {
    return (
      <PageContainer>
        <PageHeader title={pageTitle} breadcrumbs={crumbItems} />
        <MarketplaceBrowseSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer className={cn("space-y-5", compareMode && "pb-28")}>
      <PageHeader
        title={compareMode ? "Add Grades to Compare" : pageTitle}
        description={
          compareMode
            ? "Select grades below to add them to your comparison. Seller identity stays protected."
            : "Blind B2B procurement — browse grades by material, specification, price and availability. Seller identity stays protected."
        }
        breadcrumbs={
          compareMode
            ? [
                { label: "Marketplace", href: ROUTES.marketplace },
                { label: "Compare", href: ROUTES.marketplaceCompare },
                { label: "Add Grades" },
              ]
            : crumbItems
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-4"
      >
        {compareMode ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/20 bg-brand/[0.04] px-4 py-3">
            <div className="space-y-0.5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
                <GitCompareArrows className="h-4 w-4" />
                Comparison mode · {compareCount}/4 selected
              </p>
              <p className="text-xs text-slate-600">
                Use <span className="font-semibold">Add to Compare</span> on any
                grade. Return when you have at least 2 grades.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="h-9 rounded-xl">
                <Link href={ROUTES.marketplaceCompare}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Compare
                </Link>
              </Button>
              <Button
                asChild
                className="h-9 rounded-xl bg-brand hover:bg-brand-700"
                disabled={compareCount < 2}
              >
                <Link
                  href={ROUTES.marketplaceCompare}
                  className={compareCount < 2 ? "pointer-events-none opacity-60" : undefined}
                >
                  View Comparison
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-card">
            <BlindSellerBadge />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href={ROUTES.marketplaceCompare}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-50 hover:text-brand"
              >
                <GitCompareArrows className="h-4 w-4" />
                Compare
                <CompareCount />
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <MarketplaceSearchBar
            value={search}
            onChange={setSearch}
            placeholder={MARKETPLACE_SEARCH_PLACEHOLDER}
          />
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Material
          </p>
          <MaterialChips
            activeCode={activeMaterial}
            onSelect={(code) => {
              setActiveMaterial(code);
              setSearch(code ?? "");
            }}
          />
        </div>

        <MarketplaceCategoryChips
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelect={handleSelectCategory}
        />

        <OfferBanner
          activeOfferId={activeOfferId}
          onViewProducts={handleViewOfferProducts}
        />

        <FilterTopBar
          categories={categories}
          brands={[]}
          warehouses={warehouses}
          draftFilters={draftFilters}
          appliedFilters={filters}
          activeCategoryId={activeCategoryId}
          priceBounds={priceBounds}
          showCategories={false}
          onSelectCategory={handleSelectCategory}
          onToggleBrand={toggleDraftBrand}
          onPriceChange={setDraftPriceRange}
          onWarehouseChange={setDraftWarehouse}
          onCreditChange={setDraftCreditEligible}
          onApply={handleApply}
          onReset={handleReset}
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Origin:
          </span>
          {ORIGIN_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setOriginFilter(option.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                originFilter === option.value
                  ? "bg-brand text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <MarketplaceHeader
          title={headingTitle}
          resultCount={pagination.total}
          actions={<ViewToggle value={viewMode} onChange={setViewMode} />}
        />

        {pagination.items.length === 0 ? (
          <MarketplaceEmptyState
            title={
              activeOfferId
                ? "No products available for this offer."
                : undefined
            }
            description={
              activeOfferId
                ? "Try another offer or reset filters to browse all materials."
                : undefined
            }
            onReset={handleReset}
          />
        ) : viewMode === "grid" ? (
          <ProductGrid
            products={pagination.items}
            onQuickView={openQuickView}
            compareMode={compareMode}
          />
        ) : (
          <ProductList
            products={pagination.items}
            onQuickView={openQuickView}
            compareMode={compareMode}
          />
        )}

        <MarketplacePagination
          page={Math.min(page, pagination.totalPages)}
          totalPages={pagination.totalPages}
          from={pagination.from}
          to={pagination.to}
          total={pagination.total}
          onPageChange={setPage}
        />
      </motion.div>

      <QuickViewDrawer
        product={quickViewProduct}
        open={Boolean(quickViewProductId)}
        onOpenChange={(open) => {
          if (!open) closeQuickView();
        }}
      />

      <CompareTray forceVisible={compareMode} />
    </PageContainer>
  );
}

function CompareCount() {
  const count = useCompareStore((s) => s.ids.length);
  if (!count) return null;
  return (
    <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
      {count}
    </span>
  );
}
