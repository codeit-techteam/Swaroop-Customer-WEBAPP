import apiClient from "@/lib/apiClient";
import {
  brandsFromProducts,
  categoriesFromProducts,
  toMarketplaceOffer,
  toMarketplaceProduct,
  warehousesFromProducts,
  type BlindOffer,
  type BlindProduct,
} from "@/lib/catalog-mapper";
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
  let total = 0;

  do {
    const payload = await apiClient.get<Envelope<BlindProduct[]>>(
      `/customer/products?page=${page}&limit=100&sortBy=name&sortOrder=asc`,
    );
    pages.push(...(payload.data ?? []));
    totalPages = payload.meta?.totalPages ?? 1;
    total = payload.meta?.total ?? pages.length;
    page += 1;
  } while (page <= totalPages && page <= 10);

  const products = pages.map(toMarketplaceProduct);
  return {
    products,
    categories: categoriesFromProducts(products),
    brands: brandsFromProducts(products),
    warehouses: warehousesFromProducts(products),
    total,
  };
}

export async function fetchMarketplaceProduct(id: string): Promise<MarketplaceProduct> {
  const payload = await apiClient.get<Envelope<BlindProduct>>(`/customer/products/${id}`);
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
    const payload = await apiClient.get<Envelope<BlindOffer[]>>(
      `/customer/offers?page=${page}&limit=100`,
    );
    pages.push(...(payload.data ?? []));
    totalPages = payload.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 10);

  return pages.map((offer) =>
    toMarketplaceOffer(offer, offer.product?.id ? byProductId.get(offer.product.id) : undefined),
  );
}
