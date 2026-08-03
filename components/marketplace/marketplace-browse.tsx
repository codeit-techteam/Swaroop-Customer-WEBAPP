"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/constants";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import { FilterSidebar } from "./filter-sidebar";
import { MarketplaceHeader } from "./marketplace-header";
import { MarketplaceSearchBar } from "./search-bar";
import { SortDropdown } from "./sort-dropdown";
import { ViewToggle } from "./view-toggle";
import { ProductGrid } from "./product-grid";
import { ProductList } from "./product-list";
import { MarketplaceEmptyState } from "./empty-state";
import { MarketplacePagination } from "./pagination";
import { QuickViewDrawer } from "./quick-view-drawer";
import { MarketplaceBrowseSkeleton } from "./marketplace-skeleton";
import { MARKETPLACE_SEARCH_PLACEHOLDER } from "@/mock/filters";
import type { MarketplaceParentCategoryId } from "@/types/marketplace";

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
  const [ready, setReady] = useState(false);

  const categories = useMarketplaceStore((s) => s.categories);
  const brands = useMarketplaceStore((s) => s.brands);
  const warehouses = useMarketplaceStore((s) => s.warehouses);
  const draftFilters = useMarketplaceStore((s) => s.draftFilters);
  const priceBounds = useMarketplaceStore((s) => s.priceBounds);
  const search = useMarketplaceStore((s) => s.search);
  const sortBy = useMarketplaceStore((s) => s.sortBy);
  const viewMode = useMarketplaceStore((s) => s.viewMode);
  const page = useMarketplaceStore((s) => s.page);
  const quickViewProductId = useMarketplaceStore((s) => s.quickViewProductId);
  const products = useMarketplaceStore((s) => s.products);
  const selectedCategoryId = useMarketplaceStore((s) => s.selectedCategoryId);

  const setSearch = useMarketplaceStore((s) => s.setSearch);
  const setSortBy = useMarketplaceStore((s) => s.setSortBy);
  const setViewMode = useMarketplaceStore((s) => s.setViewMode);
  const setPage = useMarketplaceStore((s) => s.setPage);
  const toggleDraftCategory = useMarketplaceStore((s) => s.toggleDraftCategory);
  const toggleDraftBrand = useMarketplaceStore((s) => s.toggleDraftBrand);
  const setDraftPriceRange = useMarketplaceStore((s) => s.setDraftPriceRange);
  const setDraftWarehouse = useMarketplaceStore((s) => s.setDraftWarehouse);
  const setDraftCreditEligible = useMarketplaceStore(
    (s) => s.setDraftCreditEligible,
  );
  const applyFilters = useMarketplaceStore((s) => s.applyFilters);
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

  const pagination = getPaginatedProducts();

  const headingTitle = useMemo(() => {
    if (selectedCategoryId) {
      const category = categories.find(
        (item) => item.id === selectedCategoryId,
      );
      return category?.name ?? pageTitle;
    }
    if (draftFilters.categories.length === 1) {
      const category = categories.find(
        (item) => item.id === draftFilters.categories[0],
      );
      return category?.name ?? pageTitle;
    }
    return "All Materials";
  }, [categories, draftFilters.categories, pageTitle, selectedCategoryId]);

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

  if (!ready) {
    return (
      <PageContainer>
        <PageHeader title={pageTitle} breadcrumbs={crumbItems} />
        <MarketplaceBrowseSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title={pageTitle}
        description="Browse verified industrial grades and create purchase requests for seller approval."
        breadcrumbs={crumbItems}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        <FilterSidebar
          className="hidden lg:flex"
          categories={categories}
          brands={brands}
          warehouses={warehouses}
          draftFilters={draftFilters}
          priceBounds={priceBounds}
          onToggleCategory={(id: MarketplaceParentCategoryId) =>
            toggleDraftCategory(id)
          }
          onToggleBrand={toggleDraftBrand}
          onPriceChange={setDraftPriceRange}
          onWarehouseChange={setDraftWarehouse}
          onCreditChange={setDraftCreditEligible}
          onApply={handleApply}
          onReset={resetFilters}
        />

        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <MarketplaceSearchBar
              value={search}
              onChange={setSearch}
              placeholder={MARKETPLACE_SEARCH_PLACEHOLDER}
            />
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          {/* Mobile filter strip */}
          <div className="lg:hidden">
            <FilterSidebar
              categories={categories}
              brands={brands}
              warehouses={warehouses}
              draftFilters={draftFilters}
              priceBounds={priceBounds}
              onToggleCategory={toggleDraftCategory}
              onToggleBrand={toggleDraftBrand}
              onPriceChange={setDraftPriceRange}
              onWarehouseChange={setDraftWarehouse}
              onCreditChange={setDraftCreditEligible}
              onApply={handleApply}
              onReset={resetFilters}
            />
          </div>

          <MarketplaceHeader
            title={headingTitle}
            resultCount={pagination.total}
            actions={<ViewToggle value={viewMode} onChange={setViewMode} />}
          />

          {pagination.items.length === 0 ? (
            <MarketplaceEmptyState onReset={resetFilters} />
          ) : viewMode === "grid" ? (
            <ProductGrid
              products={pagination.items}
              onQuickView={openQuickView}
            />
          ) : (
            <ProductList
              products={pagination.items}
              onQuickView={openQuickView}
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
        </div>
      </motion.div>

      <QuickViewDrawer
        product={quickViewProduct}
        open={Boolean(quickViewProductId)}
        onOpenChange={(open) => {
          if (!open) closeQuickView();
        }}
      />
    </PageContainer>
  );
}
