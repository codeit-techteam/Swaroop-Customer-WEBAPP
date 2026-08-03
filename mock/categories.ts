import { ROUTES } from "@/constants";
import type { MarketplaceCategory } from "@/types/marketplace";

/**
 * Top-level browse categories for desktop Marketplace.
 * Polymer grade families (PP, HDPE, …) live on each product as materialType
 * and mirror the Customer App chip categories.
 */
export const categoriesMock: MarketplaceCategory[] = [
  {
    id: "polymers",
    name: "Polymers",
    slug: "polymers",
    description:
      "PP, HDPE, PVC, LLDPE, PET and engineering polymers for industrial procurement.",
    imageUrl:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
    productCount: 0,
  },
  {
    id: "chemicals",
    name: "Chemicals",
    slug: "chemicals",
    description:
      "Industrial solvents and process chemicals for manufacturing operations.",
    imageUrl:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
    productCount: 0,
  },
  {
    id: "additives",
    name: "Additives",
    slug: "additives",
    description:
      "Plasticizers, stabilizers and performance additives for polymer compounds.",
    imageUrl:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80",
    productCount: 0,
  },
  {
    id: "base-oils",
    name: "Base Oils",
    slug: "base-oils",
    description:
      "Group I–III base oils for lubricant blending and industrial formulations.",
    imageUrl:
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80",
    productCount: 0,
  },
];

export const getCategoryBySlug = (
  slug: string,
): MarketplaceCategory | undefined =>
  categoriesMock.find((category) => category.slug === slug);

export const getCategoryHref = (slug: string): string =>
  `${ROUTES.marketplaceCategory}/${slug}`;
