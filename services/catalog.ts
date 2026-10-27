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

export async function fetchMarketplaceCatalog(): Promise<{
  products: MarketplaceProduct[];
  categories: MarketplaceCategory[];
  brands: MarketplaceBrand[];
  warehouses: MarketplaceWarehouse[];
  total: number;
}> {
  const pages: BlindProduct[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const base = productsApiBase();
    const payload = await apiClient.get<Envelope<BlindProduct[]>>(
      `${base}?page=${page}&limit=100&sortBy=name&sortOrder=asc`,
      { skipAuth: base.startsWith("/public/") },
    );
    pages.push(...(payload.data ?? []));
    totalPages = payload.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 10);

  const products = dedupeMarketplaceProducts(pages.map(toMarketplaceProduct));
  return {
    products,
    categories: categoriesFromProducts(products),
    brands: brandsFromProducts(products),
    warehouses: warehousesFromProducts(products),
    total: products.length,
  };
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

export async function fetchMarketplaceOffers(
  products: MarketplaceProduct[] = [],
): Promise<MarketplaceOffer[]> {
  const pages: BlindOffer[] = [];
  let page = 1;
  let totalPages = 1;
  const byProductId = new Map(products.map((item) => [item.id, item]));

  do {
    const base = offersApiBase();
    const payload = await apiClient.get<Envelope<BlindOffer[]>>(
      `${base}?page=${page}&limit=100`,
      { skipAuth: base.startsWith("/public/") },
    );
    pages.push(...(payload.data ?? []));
    totalPages = payload.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 10);

  return pages.map((offer) =>
    toMarketplaceOffer(
      offer,
      offer.product?.id ? byProductId.get(offer.product.id) : undefined,
    ),
  );
}
