import { ROUTES } from "@/constants";
import type {
  CategoryCardItem,
  DashboardData,
  HeroBannerContent,
  PromotionOffer,
} from "@/types/dashboard";
import { creditSummaryMock, outstandingPaymentMock } from "./credit";
import { marketPricesMock, MARKET_PRICES_UPDATED_AT } from "./marketPrices";
import { recentActivityMock } from "./notifications";
import { recommendedProductsMock } from "./products";
import { purchaseRequestsMock } from "./purchaseRequests";

export const heroBannerMock: HeroBannerContent = {
  heading: "Global Petrochemical Hub",
  subtitle:
    "Enterprise-grade procurement and real-time market insights for global trading partners.",
  imageUrl:
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1920&q=80",
};

export const categoriesMock: CategoryCardItem[] = [
  {
    id: "polymers",
    name: "Polymers",
    imageUrl:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400&q=80",
    href: `${ROUTES.marketplaceCategory}/polymers`,
  },
  {
    id: "chemicals",
    name: "Chemicals",
    imageUrl:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=400&q=80",
    href: `${ROUTES.marketplaceCategory}/chemicals`,
  },
  {
    id: "liquids",
    name: "Base Oils",
    imageUrl:
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=400&q=80",
    href: `${ROUTES.marketplaceCategory}/base-oils`,
  },
  {
    id: "additives",
    name: "Additives",
    imageUrl:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=400&q=80",
    href: `${ROUTES.marketplaceCategory}/additives`,
  },
];

export const promotionMock: PromotionOffer = {
  id: "promo-bulk-pet",
  badge: "EXCLUSIVE OFFER",
  title: "Bulk PET Trading",
  description:
    "Order >500MT of PET Bottle grade and receive a 4% institutional discount on logistics.",
  ctaLabel: "Request Quote",
  href: ROUTES.purchaseRequestsCreate,
  ctaAction: "quote-form",
  minQuantityMt: 500,
};

export const dashboardMock: DashboardData = {
  hero: heroBannerMock,
  marketPrices: marketPricesMock,
  marketPricesUpdatedAt: MARKET_PRICES_UPDATED_AT,
  credit: creditSummaryMock,
  outstanding: outstandingPaymentMock,
  purchaseRequests: purchaseRequestsMock,
  recentActivity: recentActivityMock,
  categories: categoriesMock,
  recommendedProducts: recommendedProductsMock,
  promotion: promotionMock,
};
