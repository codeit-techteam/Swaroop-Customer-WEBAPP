"use client";

import { create } from "zustand";
import {
  getProductDetailById,
  getRelatedProductCards,
} from "@/mock/product-details";
import type {
  ProductDetailRecord,
  RelatedProductCard,
} from "@/types/product-details";

export interface ProductStoreState {
  selectedProduct: ProductDetailRecord | null;
  galleryIndex: number;
  relatedProducts: RelatedProductCard[];
  isLoading: boolean;

  loadProduct: (productId: string) => void;
  setGalleryIndex: (index: number) => void;
  clearProduct: () => void;
}

/**
 * productStore — mock-backed Product Details state.
 * Ready for API hydration; no network calls yet.
 */
export const useProductStore = create<ProductStoreState>((set) => ({
  selectedProduct: null,
  galleryIndex: 0,
  relatedProducts: [],
  isLoading: false,

  loadProduct: (productId) => {
    set({ isLoading: true, galleryIndex: 0 });
    const selectedProduct = getProductDetailById(productId);
    const relatedProducts = selectedProduct
      ? getRelatedProductCards(selectedProduct.relatedProductIds)
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
