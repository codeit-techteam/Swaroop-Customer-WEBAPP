"use client";

import { create } from "zustand";
import { dashboardMock } from "@/mock/dashboard";
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
  promotion: DashboardData["promotion"];
  setPeriod: (period: DashboardPeriod) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * dashboardStore — mock-backed Customer Dashboard state.
 * Wired for future API hydration; no network calls yet.
 */
export const useDashboardStore = create<DashboardStoreState>((set) => ({
  selectedPeriod: "7d",
  isLoading: false,
  hero: dashboardMock.hero,
  marketPrices: dashboardMock.marketPrices,
  marketPricesUpdatedAt: dashboardMock.marketPricesUpdatedAt,
  creditSummary: dashboardMock.credit,
  outstanding: dashboardMock.outstanding,
  purchaseRequests: dashboardMock.purchaseRequests,
  recentActivity: dashboardMock.recentActivity,
  categories: dashboardMock.categories,
  recommendedProducts: dashboardMock.recommendedProducts,
  promotion: dashboardMock.promotion,
  setPeriod: (period) => set({ selectedPeriod: period }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
