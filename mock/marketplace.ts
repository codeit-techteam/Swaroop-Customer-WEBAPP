import { categoriesMock } from "./categories";
import { brandsMock } from "./brands";
import {
  DEFAULT_MARKETPLACE_FILTERS,
  MARKETPLACE_PAGE_SIZE,
  MARKETPLACE_SEARCH_PLACEHOLDER,
  MARKETPLACE_SORT_OPTIONS,
  PRICE_RANGE_BOUNDS,
} from "./filters";
import { productsMock } from "./products";
import { recommendedProductsMock } from "./recommendations";
import { warehousesMock } from "./warehouses";
import type { MarketplaceCategory } from "@/types/marketplace";

function withProductCounts(): MarketplaceCategory[] {
  return categoriesMock.map((category) => ({
    ...category,
    productCount: productsMock.filter((p) => p.categoryId === category.id)
      .length,
  }));
}

export const marketplaceMock = {
  products: productsMock,
  categories: withProductCounts(),
  brands: brandsMock,
  warehouses: warehousesMock,
  filters: DEFAULT_MARKETPLACE_FILTERS,
  sortOptions: MARKETPLACE_SORT_OPTIONS,
  priceBounds: PRICE_RANGE_BOUNDS,
  pageSize: MARKETPLACE_PAGE_SIZE,
  searchPlaceholder: MARKETPLACE_SEARCH_PLACEHOLDER,
  featuredProducts: recommendedProductsMock,
};

export {
  brandsMock,
  categoriesMock,
  productsMock,
  warehousesMock,
  recommendedProductsMock,
  DEFAULT_MARKETPLACE_FILTERS,
  MARKETPLACE_PAGE_SIZE,
  MARKETPLACE_SEARCH_PLACEHOLDER,
  MARKETPLACE_SORT_OPTIONS,
  PRICE_RANGE_BOUNDS,
};
