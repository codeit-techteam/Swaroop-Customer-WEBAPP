"use client";

import { create } from "zustand";
import {
  getUnreadCount,
  useNotificationsCatalogStore,
} from "@/store/notificationsCatalogStore";

export interface NotificationStoreState {
  /** Derived from catalog — kept for top-nav / bell compatibility */
  unreadCount: number;
  isPanelOpen: boolean;
  isLoading: boolean;
  setPanelOpen: (open: boolean) => void;
  markAllRead: () => void;
  syncUnreadFromCatalog: () => void;
}

/**
 * notificationStore — thin façade over notificationsCatalogStore for the bell badge.
 * Unread count syncs from the catalog; markAllRead delegates to catalog.
 */
export const useNotificationStore = create<NotificationStoreState>((set) => ({
  unreadCount: getUnreadCount(
    useNotificationsCatalogStore.getState().notifications,
  ),
  isPanelOpen: false,
  isLoading: false,
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  markAllRead: () => {
    useNotificationsCatalogStore.getState().markAllRead();
    set({
      unreadCount: getUnreadCount(
        useNotificationsCatalogStore.getState().notifications,
      ),
    });
  },
  syncUnreadFromCatalog: () =>
    set({
      unreadCount: getUnreadCount(
        useNotificationsCatalogStore.getState().notifications,
      ),
    }),
}));

useNotificationsCatalogStore.subscribe((state) => {
  useNotificationStore.setState({
    unreadCount: getUnreadCount(state.notifications),
  });
});

export { getUnreadCount };
