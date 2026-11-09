import type {
  ProductGalleryImage,
  QualityAssurance,
} from "@/types/product-details";

/** Blind marketplace — no product photography. Keep empty gallery. */
export const PRODUCT_GALLERY_IMAGES: ProductGalleryImage[] = [];

export const DEFAULT_QUALITY_ASSURANCE: QualityAssurance = {
  title: "Quality documentation",
  subtitle:
    "Technical Data Sheet and quality documents appear here only when a verified file has been provided for this grade.",
  badges: [],
};

export const EMPTY_QUALITY_ASSURANCE: QualityAssurance = {
  title: "Quality documentation",
  subtitle: "Technical Data Sheet not available yet for this grade.",
  badges: [],
};

export function buildGalleryFromProduct(
  _productImage: string,
  _productName: string,
): ProductGalleryImage[] {
  return [];
}
