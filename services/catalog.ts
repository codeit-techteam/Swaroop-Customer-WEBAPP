import apiClient from "@/lib/apiClient";
import {
  brandsFromProducts,
  categoriesFromProducts,
  dedupeMarketplaceProducts,
  toMarketplaceOffer,
  toMarketplaceProduct,
  warehousesFromProducts,
  type BlindOffer,
  type BlindProduct,
} from "@/lib/catalog-mapper";
import { offersApiBase, productsApiBase } from "@/lib/marketplace-api-base";
import type {
  MarketplaceBrand,
  MarketplaceCategory,
  MarketplaceProduct,
  MarketplaceWarehouse,
} from "@/types/marketplace";
import type { MarketplaceOffer } from "@/types/offers";

type Envelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

/** Page size for marketplace catalogue requests. */
export const MARKETPLACE_PAGE_LIMIT = 48;
/** Hard cap — never fan out past this many pages (was 10×100 = 429 storms). */
const MAX_PAGES = 3;

type CatalogResult = {
  products: MarketplaceProduct[];
  categories: MarketplaceCategory[];
  brands: MarketplaceBrand[];
  warehouses: MarketplaceWarehouse[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
};

let catalogInflight: Promise<CatalogResult> | null = null;
let offersInflight: Promise<MarketplaceOffer[]> | null = null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchProductPage(
  page: number,
  limit: number,
): Promise<{
  items: BlindProduct[];
  meta: NonNullable<Envelope<unknown>["meta"]>;
}> {
  const base = productsApiBase();
  const payload = await apiClient.get<Envelope<BlindProduct[]>>(
    `${base}?page=${page}&limit=${limit}&sortBy=name&sortOrder=asc`,
    { skipAuth: base.startsWith("/public/") },
  );
  return {
    items: payload.data ?? [],
    meta: payload.meta ?? {
      page,
      limit,
      total: payload.data?.length ?? 0,
      totalPages: 1,
    },
  };
}

async function fetchOfferPage(
  page: number,
  limit: number,
): Promise<{
  items: BlindOffer[];
  meta: NonNullable<Envelope<unknown>["meta"]>;
}> {
  const base = offersApiBase();
  const payload = await apiClient.get<Envelope<BlindOffer[]>>(
    `${base}?page=${page}&limit=${limit}`,
    { skipAuth: base.startsWith("/public/") },
  );
  return {
    items: payload.data ?? [],
    meta: payload.meta ?? {
      page,
      limit,
      total: payload.data?.length ?? 0,
      totalPages: 1,
    },
  };
}

/**
 * Load marketplace products with server pagination.
 * Starts with one page; optionally walks a small number of extra pages
 * sequentially (never parallel, never > MAX_PAGES) so React Strict Mode /
 * multi-mount cannot trigger a 10×100 retry storm.
 */
export async function fetchMarketplaceCatalog(): Promise<CatalogResult> {
  if (catalogInflight) return catalogInflight;

  catalogInflight = (async () => {
    const pages: BlindProduct[] = [];
    const first = await fetchProductPage(1, MARKETPLACE_PAGE_LIMIT);
    pages.push(...first.items);
    let page = 2;
    const totalPages = Math.min(first.meta.totalPages, MAX_PAGES);
    while (page <= totalPages) {
      // Gentle stagger reduces burst pressure on the shared catalogue bucket.
      await sleep(40);
      const next = await fetchProductPage(page, MARKETPLACE_PAGE_LIMIT);
      pages.push(...next.items);
      page += 1;
    }

    const products = dedupeMarketplaceProducts(pages.map(toMarketplaceProduct));
    return {
      products,
      categories: categoriesFromProducts(products),
      brands: brandsFromProducts(products),
      warehouses: warehousesFromProducts(products),
      total: first.meta.total,
      page: 1,
      totalPages: first.meta.totalPages,
      hasMore: first.meta.totalPages > MAX_PAGES,
    };
  })().finally(() => {
    catalogInflight = null;
  });

  return catalogInflight;
}

export async function fetchMarketplaceProduct(
  id: string,
): Promise<MarketplaceProduct> {
  const base = productsApiBase();
  const payload = await apiClient.get<Envelope<BlindProduct>>(`${base}/${id}`, {
    skipAuth: base.startsWith("/public/"),
  });
  return toMarketplaceProduct(payload.data);
}

/**
 * First wave of offers (capped pages, sequential, in-flight deduped).
 */
export async function fetchMarketplaceOffers(
  products: MarketplaceProduct[] = [],
): Promise<MarketplaceOffer[]> {
  if (offersInflight) return offersInflight;

  offersInflight = (async () => {
    const byProductId = new Map(products.map((item) => [item.id, item]));
    const pages: BlindOffer[] = [];
    const first = await fetchOfferPage(1, MARKETPLACE_PAGE_LIMIT);
    pages.push(...first.items);
    let page = 2;
    const totalPages = Math.min(first.meta.totalPages, MAX_PAGES);
    while (page <= totalPages) {
      await sleep(40);
      const next = await fetchOfferPage(page, MARKETPLACE_PAGE_LIMIT);
      pages.push(...next.items);
      page += 1;
    }
    return pages.map((offer) =>
      toMarketplaceOffer(
        offer,
        offer.product?.id ? byProductId.get(offer.product.id) : undefined,
      ),
    );
  })().finally(() => {
    offersInflight = null;
  });

  return offersInflight;
}
