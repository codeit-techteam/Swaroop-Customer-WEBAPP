import type {
  MarketplaceFiltersState,
  PriceRangeBounds,
  SortOption,
} from "@/types/marketplace";

export const PRICE_RANGE_BOUNDS: PriceRangeBounds = {
  min: 60_000,
  max: 500_000,
  step: 1_000,
};

export const DEFAULT_MARKETPLACE_FILTERS: MarketplaceFiltersState = {
  categories: [],
  brands: [],
  priceMin: PRICE_RANGE_BOUNDS.min,
  priceMax: PRICE_RANGE_BOUNDS.max,
  warehouseId: null,
  creditEligibleOnly: false,
};

export const MARKETPLACE_SORT_OPTIONS: SortOption[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
];

export const MARKETPLACE_PAGE_SIZE = 12;

export const MARKETPLACE_SEARCH_PLACEHOLDER =
  "Search Grade, CAS No., or Application...";

export const FILTER_PANEL_TITLE = "Catalog Filters";
export const FILTER_PANEL_SUBTITLE = "REFINE SELECTION";
