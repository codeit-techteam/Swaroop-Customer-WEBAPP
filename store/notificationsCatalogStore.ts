"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_NOTIFICATION_FILTERS,
  DEFAULT_NOTIFICATION_PREFERENCES,
  notificationsCatalogMock,
} from "@/mock/notifications-catalog";
import { VIEW_FILTER_TO_CATEGORY } from "@/constants/notifications";
import { isMvpNotification } from "@/lib/notification-actions";
import {
  DATE_GROUP_LABELS,
  getDateGroupKey,
  isWithinTimeFilter,
  type DateGroupKey,
} from "@/lib/notification-time";
import type {
  AppNotification,
  NotificationCategory,
  NotificationDateGroup,
  NotificationPreferences,
  NotificationViewFilter,
  NotificationsDashboardSummary,
  NotificationsFiltersState,
} from "@/types/notifications";

const STORAGE_KEY = "petrotrade.notifications-mvp.v1";

export interface NotificationsCatalogStoreState {
  notifications: AppNotification[];
  filters: NotificationsFiltersState;
  selectedIds: string[];
  detailId: string | null;
  preferences: NotificationPreferences;
  isHydrated: boolean;
  isLoading: boolean;

  setHydrated: (v: boolean) => void;
  setFilters: (patch: Partial<NotificationsFiltersState>) => void;
  resetFilters: () => void;
  applyViewFilter: (view: NotificationViewFilter) => void;
  setDetailId: (id: string | null) => void;
  toggleSelected: (id: string) => void;
  selectAllVisible: (ids: string[]) => void;
  clearSelection: () => void;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  markAllRead: () => void;
  markSelectedRead: () => void;
  deleteNotification: (id: string) => void;
  deleteSelected: () => void;
  archiveNotification: (id: string) => void;
  setPreferences: (patch: Partial<NotificationPreferences>) => void;
  resetPreferences: () => void;
}

function matchesSearch(n: AppNotification, q: string) {
  if (!q) return true;
  const hay = [
    n.title,
    n.description,
    n.referenceNumber,
    n.orderNumber,
    n.poNumber,
    n.invoiceNumber,
    n.productName,
    n.relatedProduct,
    n.warehouse,
    n.seller,
    n.paymentId,
    n.shipmentId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

const PRIORITY_RANK: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
  completed: 3,
};

export function getVisibleNotifications(
  notifications: AppNotification[],
  filters: NotificationsFiltersState,
): AppNotification[] {
  let list = notifications.filter((n) => n.status !== "deleted");

  const q = filters.search.trim().toLowerCase();
  if (q) list = list.filter((n) => matchesSearch(n, q));

  if (filters.status === "unread") {
    list = list.filter((n) => n.status === "unread");
  } else if (filters.status === "read") {
    list = list.filter((n) => n.status === "read" || n.status === "archived");
  }

  if (filters.priority !== "all") {
    list = list.filter((n) => n.priority === filters.priority);
  }

  if (filters.categoryIn && filters.categoryIn.length > 0) {
    const set = new Set(filters.categoryIn);
    list = list.filter((n) => set.has(n.category));
  } else if (filters.category !== "all") {
    list = list.filter((n) => n.category === filters.category);
  }

  list = list.filter((n) => isWithinTimeFilter(n.createdAt, filters.time));

  list = [...list].sort((a, b) => {
    switch (filters.sortBy) {
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "priority_high":
        return (
          (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "priority_low":
        return (
          (PRIORITY_RANK[b.priority] ?? 9) - (PRIORITY_RANK[a.priority] ?? 9) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "unread_first":
        if (a.status === "unread" && b.status !== "unread") return -1;
        if (b.status === "unread" && a.status !== "unread") return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "newest":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  return list;
}

export function groupNotificationsByDate(
  items: AppNotification[],
): NotificationDateGroup[] {
  const buckets: Record<DateGroupKey, AppNotification[]> = {
    today: [],
    yesterday: [],
    last_week: [],
    older: [],
  };
  for (const item of items) {
    buckets[getDateGroupKey(item.createdAt)].push(item);
  }
  return (Object.keys(buckets) as DateGroupKey[])
    .filter((k) => buckets[k].length > 0)
    .map((k) => ({
      key: k,
      label: DATE_GROUP_LABELS[k],
      items: buckets[k],
    }));
}

export function computeNotificationsSummary(
  notifications: AppNotification[],
): NotificationsDashboardSummary {
  const active = notifications.filter((n) => n.status !== "deleted");
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const weekStart = todayStart - 7 * 86_400_000;

  return {
    total: active.length,
    unread: active.filter((n) => n.status === "unread").length,
    today: active.filter((n) => new Date(n.createdAt).getTime() >= todayStart)
      .length,
    thisWeek: active.filter((n) => new Date(n.createdAt).getTime() >= weekStart)
      .length,
    priorityAlerts: active.filter(
      (n) => n.status === "unread" && n.priority === "high",
    ).length,
  };
}

/** Chronological MVP feed — business notifications only, newest first. */
export function getMvpFeedNotifications(
  notifications: AppNotification[],
): AppNotification[] {
  return notifications
    .filter(isMvpNotification)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getUnreadCount(notifications: AppNotification[]): number {
  return notifications.filter(
    (n) => isMvpNotification(n) && n.status === "unread",
  ).length;
}

function categoriesForView(
  view: Exclude<NotificationViewFilter, "all" | "unread">,
): NotificationCategory[] {
  const mapped = VIEW_FILTER_TO_CATEGORY[view];
  return Array.isArray(mapped) ? mapped : [mapped];
}

export const useNotificationsCatalogStore =
  create<NotificationsCatalogStoreState>()(
    persist(
      (set, get) => ({
        notifications: notificationsCatalogMock,
        filters: { ...DEFAULT_NOTIFICATION_FILTERS },
        selectedIds: [],
        detailId: null,
        preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
        isHydrated: false,
        isLoading: false,

        setHydrated: (v) => set({ isHydrated: v }),

        setFilters: (patch) =>
          set((s) => ({ filters: { ...s.filters, ...patch } })),

        resetFilters: () =>
          set({ filters: { ...DEFAULT_NOTIFICATION_FILTERS } }),

        applyViewFilter: (view) => {
          if (view === "all") {
            set({
              filters: {
                ...DEFAULT_NOTIFICATION_FILTERS,
                status: "all",
                category: "all",
                categoryIn: null,
              },
            });
            return;
          }
          if (view === "unread") {
            set({
              filters: {
                ...DEFAULT_NOTIFICATION_FILTERS,
                status: "unread",
                category: "all",
                categoryIn: null,
              },
            });
            return;
          }
          const cats = categoriesForView(view);
          set({
            filters: {
              ...DEFAULT_NOTIFICATION_FILTERS,
              category: cats.length === 1 ? cats[0] : "all",
              categoryIn: cats.length > 1 ? cats : null,
              status: "all",
            },
          });
        },

        setDetailId: (id) => set({ detailId: id }),

        toggleSelected: (id) =>
          set((s) => ({
            selectedIds: s.selectedIds.includes(id)
              ? s.selectedIds.filter((x) => x !== id)
              : [...s.selectedIds, id],
          })),

        selectAllVisible: (ids) => set({ selectedIds: ids }),

        clearSelection: () => set({ selectedIds: [] }),

        markRead: (id) =>
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.id === id && n.status === "unread"
                ? { ...n, status: "read" as const }
                : n,
            ),
          })),

        markUnread: (id) =>
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.id === id && n.status !== "deleted"
                ? { ...n, status: "unread" as const }
                : n,
            ),
          })),

        markAllRead: () =>
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.status === "unread" ? { ...n, status: "read" as const } : n,
            ),
          })),

        markSelectedRead: () => {
          const ids = new Set(get().selectedIds);
          set((s) => ({
            notifications: s.notifications.map((n) =>
              ids.has(n.id) && n.status === "unread"
                ? { ...n, status: "read" as const }
                : n,
            ),
            selectedIds: [],
          }));
        },

        deleteNotification: (id) =>
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, status: "deleted" as const } : n,
            ),
            selectedIds: s.selectedIds.filter((x) => x !== id),
            detailId: s.detailId === id ? null : s.detailId,
          })),

        deleteSelected: () => {
          const ids = new Set(get().selectedIds);
          set((s) => ({
            notifications: s.notifications.map((n) =>
              ids.has(n.id) ? { ...n, status: "deleted" as const } : n,
            ),
            selectedIds: [],
            detailId: s.detailId && ids.has(s.detailId) ? null : s.detailId,
          }));
        },

        archiveNotification: (id) =>
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, status: "archived" as const } : n,
            ),
          })),

        setPreferences: (patch) =>
          set((s) => ({ preferences: { ...s.preferences, ...patch } })),

        resetPreferences: () =>
          set({ preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES } }),
      }),
      {
        name: STORAGE_KEY,
        partialize: (s) => ({
          notifications: s.notifications,
          preferences: s.preferences,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHydrated(true);
        },
      },
    ),
  );
