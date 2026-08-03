import type {
  ProductGalleryImage,
  QualityAssurance,
} from "@/types/product-details";

export const PRODUCT_GALLERY_IMAGES: ProductGalleryImage[] = [
  {
    id: "img-1",
    url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
    alt: "Polymer granules in laboratory glassware",
  },
  {
    id: "img-2",
    url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80",
    alt: "Industrial packaging bags of polymer resin",
  },
  {
    id: "img-3",
    url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80",
    alt: "Warehouse palletized petrochemical inventory",
  },
  {
    id: "img-4",
    url: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1200&q=80",
    alt: "Petrochemical plant storage facility",
  },
  {
    id: "img-5",
    url: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80",
    alt: "Quality inspection of polymer samples",
  },
  {
    id: "img-6",
    url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80",
    alt: "Bulk resin bags ready for dispatch",
  },
];

export const DEFAULT_QUALITY_ASSURANCE: QualityAssurance = {
  title: "Certified Quality",
  subtitle: "Verified by Reliance Lab & Third-Party Auditors.",
  badges: ["Lab Tested", "Third Party Audited", "ISO Certified"],
};

export function buildGalleryFromProduct(
  productImage: string,
  productName: string,
): ProductGalleryImage[] {
  const primary: ProductGalleryImage = {
    id: "img-primary",
    url: productImage,
    alt: productName,
  };
  const rest = PRODUCT_GALLERY_IMAGES.filter(
    (image) => image.url !== productImage,
  ).slice(0, 5);
  return [primary, ...rest];
}
