"use client";

import { create } from "zustand";
import {
  getProductDetailById,
  getRelatedProductCards,
} from "@/mock/product-details";
import {
  getPublishedProductsCache,
  publishedProductToDetail,
} from "@/lib/cx-feed";
import type {
  ProductDetailRecord,
  RelatedProductCard,
} from "@/types/product-details";
import { ROUTES } from "@/constants";

export interface ProductStoreState {
  selectedProduct: ProductDetailRecord | null;
  galleryIndex: number;
  relatedProducts: RelatedProductCard[];
  isLoading: boolean;

  loadProduct: (productId: string) => void;
  setGalleryIndex: (index: number) => void;
  clearProduct: () => void;
}

function relatedFromPublished(
  relatedProductIds: string[],
): RelatedProductCard[] {
  const cache = getPublishedProductsCache();
  if (!cache.length) {
    return getRelatedProductCards(relatedProductIds);
  }

  return relatedProductIds
    .map((id) => cache.find((item) => item.id === id))
    .filter((product): product is NonNullable<typeof product> =>
      Boolean(product),
    )
    .map((product) => ({
      id: product.id,
      name: product.name,
      brandName: product.brand,
      categoryLabel: product.material.toUpperCase(),
      pricePerMt: product.sellingPrice,
      warehouseLabel: product.location,
      stockLabel: `${product.availableQty.toLocaleString("en-IN")} MT`,
      imageUrl: product.images[0] ?? "",
      href: `${ROUTES.marketplaceProduct}/${product.id}`,
    }));
}

/**
 * productStore — prefers admin-published CX feed, falls back to local mocks.
 */
export const useProductStore = create<ProductStoreState>((set) => ({
  selectedProduct: null,
  galleryIndex: 0,
  relatedProducts: [],
  isLoading: false,

  loadProduct: (productId) => {
    set({ isLoading: true, galleryIndex: 0 });
    const published = getPublishedProductsCache().find(
      (item) => item.id === productId,
    );
    const selectedProduct = published
      ? publishedProductToDetail(published)
      : getProductDetailById(productId);
    const relatedProducts = selectedProduct
      ? relatedFromPublished(selectedProduct.relatedProductIds)
      : [];
    set({
      selectedProduct,
      relatedProducts,
      isLoading: false,
    });
  },

  setGalleryIndex: (index) => set({ galleryIndex: index }),

  clearProduct: () =>
    set({
      selectedProduct: null,
      relatedProducts: [],
      galleryIndex: 0,
    }),
}));
