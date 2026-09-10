import type {
  ProductGalleryImage,
  QualityAssurance,
} from "@/types/product-details";

/** Blind marketplace — no product photography. Keep empty gallery. */
export const PRODUCT_GALLERY_IMAGES: ProductGalleryImage[] = [];

export const DEFAULT_QUALITY_ASSURANCE: QualityAssurance = {
  title: "Certified Quality",
  subtitle:
    "Issued Through PetroTrade Quality Assurance · Verified By PetroTrade QC",
  badges: ["Quality Assured", "GST Compliant", "NABL Approved Lab"],
};

export function buildGalleryFromProduct(
  _productImage: string,
  _productName: string,
): ProductGalleryImage[] {
  return [];
}
