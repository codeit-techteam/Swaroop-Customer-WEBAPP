"use client";

import { create } from "zustand";
import { dashboardMock } from "@/mock/dashboard";
import { toDashboardCredit, fetchCustomerCreditLimit } from "@/services/credit";
import { fetchCustomerPurchaseRequests } from "@/services/purchase-requests";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import type {
  ActivityItem,
  CreditSummary,
  DashboardData,
  MarketPrice,
  OutstandingPayment,
  PurchaseRequestSummary,
  RecommendedProduct,
} from "@/types/dashboard";

export type DashboardPeriod = "7d" | "30d" | "90d" | "ytd";

export interface DashboardStoreState {
  selectedPeriod: DashboardPeriod;
  isLoading: boolean;
  hero: DashboardData["hero"];
  marketPrices: MarketPrice[];
  marketPricesUpdatedAt: string;
  creditSummary: CreditSummary;
  outstanding: OutstandingPayment;
  purchaseRequests: PurchaseRequestSummary[];
  recentActivity: ActivityItem[];
  categories: DashboardData["categories"];
  recommendedProducts: RecommendedProduct[];
  promotion: DashboardData["promotion"] | null;
  setPeriod: (period: DashboardPeriod) => void;
  setLoading: (loading: boolean) => void;
  hydrateFromCatalog: () => void;
  fetchLive: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStoreState>((set) => ({
  selectedPeriod: "7d",
  isLoading: false,
  hero: dashboardMock.hero,
  marketPrices: [],
  marketPricesUpdatedAt: new Date().toISOString(),
  creditSummary: {
    availableCredit: 0,
    creditLimit: 0,
    currency: "INR",
    availablePercent: 0,
  },
  outstanding: {
    amount: 0,
    currency: "INR",
    invoiceId: "",
    dueLabel: "No invoices due",
  },
  purchaseRequests: [],
  recentActivity: [],
  categories: dashboardMock.categories,
  recommendedProducts: [],
  promotion: null,
  setPeriod: (period) => set({ selectedPeriod: period }),
  setLoading: (loading) => set({ isLoading: loading }),
  hydrateFromCatalog: () => {
    const products = useMarketplaceStore.getState().products;
    const recommendedProducts: RecommendedProduct[] = products.slice(0, 6).map((product) => ({
      id: product.id,
      name: product.name,
      grade: product.grade,
      description: product.description,
      priceInr: product.price,
      unit: "MT",
      imageUrl: product.image,
      stockStatus: product.stockStatus,
      category:
        product.categoryId === "chemicals"
          ? "chemicals"
          : product.categoryId === "additives"
            ? "additives"
            : product.categoryId === "base-oils"
              ? "liquids"
              : "polymers",
    }));
    const byGrade = new Map<string, MarketPrice>();
    for (const product of products) {
      if (!product.grade || !product.price) continue;
      if (!byGrade.has(product.grade)) {
        byGrade.set(product.grade, {
          id: product.id,
          code: product.grade,
          label: product.name,
          priceInr: product.price,
          unit: "MT",
          changePercent: 0,
          trend: "flat",
        });
      }
      if (byGrade.size >= 6) break;
    }
    const cheapest = [...products].filter((item) => item.price > 0).sort((a, b) => a.price - b.price)[0];
    set({
      recommendedProducts,
      marketPrices: [...byGrade.values()],
      marketPricesUpdatedAt: new Date().toISOString(),
      promotion: cheapest
        ? {
            id: cheapest.id,
            badge: "LIVE MARKET",
            title: cheapest.name,
            description: `${cheapest.grade} currently listed at ₹${Math.round(cheapest.price).toLocaleString("en-IN")}/MT.`,
            ctaLabel: "View Marketplace",
            href: "/marketplace",
            minQuantityMt: cheapest.moq,
          }
        : null,
    });
  },
  fetchLive: async () => {
    try {
      const [limit, requests] = await Promise.all([
        fetchCustomerCreditLimit(),
        fetchCustomerPurchaseRequests(),
      ]);
      const mapped = toDashboardCredit(limit);
      const purchaseRequests: PurchaseRequestSummary[] = requests.slice(0, 8).map((item) => ({
        id: item.id,
        displayId: item.displayId,
        material: item.productName,
        materialDetail: item.grade,
        quantityMt: item.quantityMt,
        status:
          item.status === "approved"
            ? "approved"
            : item.status === "cancelled"
              ? "cancelled"
              : item.status === "expired"
                ? "cancelled"
                : "pending_seller_approval",
        orderId: item.orderId,
        createdAt: item.createdAt,
      }));
      set({
        ...mapped,
        purchaseRequests,
        recentActivity: purchaseRequests.map((item) => ({
          id: item.id,
          type: "purchase_request_submitted",
          title: item.displayId,
          description: `${item.material} · ${item.quantityMt} MT`,
          timestamp: item.createdAt,
          relativeTime: "",
          href: "/purchase-requests",
        })),
      });
    } catch {
      set({
        purchaseRequests: [],
        recentActivity: [],
      });
    }
  },
}));
