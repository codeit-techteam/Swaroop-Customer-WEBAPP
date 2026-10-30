import type {
  ProductGalleryImage,
  QualityAssurance,
} from "@/types/product-details";

/** Blind marketplace — no product photography. Keep empty gallery. */
export const PRODUCT_GALLERY_IMAGES: ProductGalleryImage[] = [];

export const DEFAULT_QUALITY_ASSURANCE: QualityAssurance = {
  title: "Quality documentation",
  subtitle:
    "Quality documents are shown when they have been provided for this grade.",
  badges: ["GST Compliant"],
};

export function buildGalleryFromProduct(
  _productImage: string,
  _productName: string,
): ProductGalleryImage[] {
  return [];
}
