import type { MarketplaceBrand } from "@/types/marketplace";

/**
 * Brands for desktop catalog filters.
 * Customer App market is blind (no brand on listings); web design surfaces brand.
 */
export const brandsMock: MarketplaceBrand[] = [
  {
    id: "brand-reliance",
    name: "Reliance Industries",
    shortName: "RELIANCE",
  },
  {
    id: "brand-nayara",
    name: "Nayara Energy",
    shortName: "NAYARA",
  },
  {
    id: "brand-adani",
    name: "Adani Petrochem",
    shortName: "ADANI",
  },
];

export const getBrandById = (id: string): MarketplaceBrand | undefined =>
  brandsMock.find((brand) => brand.id === id);
