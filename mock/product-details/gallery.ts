import type {
  ProductGalleryImage,
  QualityAssurance,
} from "@/types/product-details";

/** Blind marketplace — no product photography. Keep empty gallery. */
export const PRODUCT_GALLERY_IMAGES: ProductGalleryImage[] = [];

export const DEFAULT_QUALITY_ASSURANCE: QualityAssurance = {
  title: "Certified Quality",
  subtitle:
    "Issued Through PolyStoreX Quality Assurance · Verified By PolyStoreX QC",
  badges: ["Quality Assured", "GST Compliant", "NABL Approved Lab"],
};

export function buildGalleryFromProduct(
  _productImage: string,
  _productName: string,
): ProductGalleryImage[] {
  return [];
}
