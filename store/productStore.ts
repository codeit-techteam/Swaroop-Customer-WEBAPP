"use client";

import { create } from "zustand";
import { buildProductDetail } from "@/mock/product-details";
import { fetchMarketplaceProduct } from "@/services/catalog";
import { useMarketplaceStore } from "@/store/marketplaceStore";
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
  loadError: string | null;
  loadProduct: (productId: string) => Promise<void>;
  setGalleryIndex: (index: number) => void;
  clearProduct: () => void;
}

function relatedCards(excludeId: string): RelatedProductCard[] {
  return useMarketplaceStore
    .getState()
    .products.filter((item) => item.id !== excludeId)
    .slice(0, 8)
    .map((product) => ({
      id: product.id,
      name: product.name,
      brandName: product.brandName,
      categoryLabel: product.materialType.toUpperCase(),
      pricePerMt: product.price,
      warehouseLabel: product.warehouseLabel,
      stockLabel: `${product.stock.toLocaleString("en-IN")} MT`,
      imageUrl: "",
      href: `${ROUTES.marketplaceProduct}/${product.id}`,
    }));
}

export const useProductStore = create<ProductStoreState>((set) => ({
  selectedProduct: null,
  galleryIndex: 0,
  relatedProducts: [],
  isLoading: false,
  loadError: null,

  loadProduct: async (productId) => {
    set({ isLoading: true, galleryIndex: 0, loadError: null });
    try {
      const product = await fetchMarketplaceProduct(productId);
      const related = relatedCards(product.id);
      set({
        selectedProduct: buildProductDetail(
          product,
          related.map((item) => item.id),
        ),
        relatedProducts: related,
        isLoading: false,
        loadError: null,
      });
    } catch (error) {
      set({
        selectedProduct: null,
        relatedProducts: [],
        isLoading: false,
        loadError:
          error instanceof Error ? error.message : "Unable to load product.",
      });
    }
  },

  setGalleryIndex: (index) => set({ galleryIndex: index }),

  clearProduct: () =>
    set({
      selectedProduct: null,
      relatedProducts: [],
      galleryIndex: 0,
      loadError: null,
    }),
}));
