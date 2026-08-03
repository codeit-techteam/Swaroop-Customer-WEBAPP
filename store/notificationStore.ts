"use client";

import { create } from "zustand";
import { recentActivityMock } from "@/mock/notifications";

export interface NotificationStoreState {
  unreadCount: number;
  isPanelOpen: boolean;
  isLoading: boolean;
  setPanelOpen: (open: boolean) => void;
  markAllRead: () => void;
}

const initialUnread = recentActivityMock.length;

/**
 * notificationStore — mock unread count from recent activity.
 * No API logic in the foundation phase.
 */
export const useNotificationStore = create<NotificationStoreState>((set) => ({
  unreadCount: initialUnread,
  isPanelOpen: false,
  isLoading: false,
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  markAllRead: () => set({ unreadCount: 0 }),
}));

export { initialUnread as notificationStoreInitialUnread };
