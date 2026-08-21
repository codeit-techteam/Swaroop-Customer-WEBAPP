import { env } from "@/lib/env";
import { useDashboardStore } from "@/store/dashboardStore";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import type {
  MarketplaceParentCategoryId,
  MarketplaceProduct,
  MaterialGradeCategory,
} from "@/types/marketplace";

interface PublishedProduct {
  id: string;
  name: string;
  grade: string;
  material: string;
  brand: string;
  categoryId: string;
  description: string;
  images: string[];
  packaging: string;
  unit: string;
  moq: number;
  availableQty: number;
  stockIndicator: "in_stock" | "limited" | "out_of_stock";
  location: string;
  sellingPrice: number;
  etaLabel: string;
}

interface PublishedBanner {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  status: string;
}

interface PublishedOffer {
  id: string;
  name: string;
  discountValue: number;
  minQty: number;
  terms: string;
  status: string;
}

interface PublishedSnapshot {
  publishedAt: string;
  products: PublishedProduct[];
  banners: PublishedBanner[];
  offers: PublishedOffer[];
}

const MATERIAL_MAP: Record<string, MaterialGradeCategory> = {
  Polypropylene: "Polypropylene",
  HDPE: "HDPE",
  LDPE: "HDPE",
  LLDPE: "LLDPE",
  PVC: "PVC",
  PET: "PET",
};

function toParentCategory(categoryId: string): MarketplaceParentCategoryId {
  if (categoryId.includes("other") || categoryId.includes("chem")) return "chemicals";
  return "polymers";
}

function toMarketplaceProduct(product: PublishedProduct): MarketplaceProduct {
  return {
    id: product.id,
    name: product.name,
    grade: product.grade,
    categoryId: toParentCategory(product.categoryId),
    materialType: MATERIAL_MAP[product.material] ?? "Polypropylene",
    brandId: `brand-${product.brand.toLowerCase().replace(/\s+/g, "-")}`,
    brandName: product.brand,
    brandShortName: product.brand.slice(0, 10).toUpperCase(),
    description: product.description,
    price: product.sellingPrice,
    unit: "MT",
    origin: product.location,
    warehouseId: "wh-published",
    warehouseLabel: product.location,
    stock: product.availableQty,
    moq: product.moq,
    eta: product.etaLabel,
    badge: product.stockIndicator === "limited" ? "Limited Stock" : "Best Value",
    image: product.images[0] ?? "",
    images: product.images,
    casNumber: "",
    applications: [product.packaging],
    creditEligible: true,
    stockStatus: product.stockIndicator,
    createdAt: new Date().toISOString(),
    popularityScore: 90,
    supplyOrigin: "domestic",
  };
}

export async function hydrateCustomerExperienceFeed() {
  try {
    const response = await fetch(`${env.cxApiUrl}/api/cx/published`, {
      cache: "no-store",
    });
    if (!response.ok) return;
    const payload = (await response.json()) as { data?: PublishedSnapshot };
    const snapshot = payload.data;
    if (!snapshot?.products?.length) return;

    const mapped = snapshot.products.map(toMarketplaceProduct);
    useMarketplaceStore.setState({
      products: mapped,
      isLoading: false,
    });

    const hero = snapshot.banners[0];
    const offer = snapshot.offers[0];
    useDashboardStore.setState({
      ...(hero
        ? {
            hero: {
              heading: hero.title,
              subtitle: hero.subtitle,
              imageUrl: hero.imageUrl,
            },
          }
        : {}),
      recommendedProducts: mapped.slice(0, 4).map((product) => ({
        id: product.id,
        name: product.name,
        grade: product.grade,
        description: product.description,
        priceInr: product.price,
        unit: "MT" as const,
        imageUrl: product.image,
        stockStatus: product.stockStatus,
        category:
          product.categoryId === "chemicals"
            ? ("chemicals" as const)
            : ("polymers" as const),
      })),
      ...(offer
        ? {
            promotion: {
              id: offer.id,
              badge: "LIVE OFFER",
              title: offer.name,
              description: offer.terms,
              ctaLabel: "View Offer",
              href: "/marketplace",
              minQuantityMt: offer.minQty,
            },
          }
        : {}),
    });
  } catch {
    // Seller panel feed is optional while both apps run independently.
  }
}
