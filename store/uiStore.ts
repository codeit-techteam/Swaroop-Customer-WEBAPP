"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UiTheme = "light" | "dark" | "system";

export interface UiStoreState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  /** Menu ids currently expanded in the sidebar */
  sidebarExpandedIds: string[];
  theme: UiTheme;
}

export interface UiStoreActions {
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;
  toggleSidebarMobile: () => void;
  toggleNavExpanded: (id: string) => void;
  setNavExpanded: (id: string, expanded: boolean) => void;
  /** Expand the active section and collapse other accordion groups. */
  syncSidebarToPath: (
    activeTopId: string | null,
    topLevelIds: string[],
  ) => void;
  setTheme: (theme: UiTheme) => void;
}

export type UiStore = UiStoreState & UiStoreActions;

const initialState: UiStoreState = {
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  sidebarExpandedIds: [],
  theme: "light",
};

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleSidebarCollapsed: () =>
        set({ sidebarCollapsed: !get().sidebarCollapsed }),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),

      toggleSidebarMobile: () =>
        set({ sidebarMobileOpen: !get().sidebarMobileOpen }),

      toggleNavExpanded: (id) => {
        const current = get().sidebarExpandedIds;
        set({
          sidebarExpandedIds: current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id],
        });
      },

      setNavExpanded: (id, expanded) => {
        const current = get().sidebarExpandedIds;
        const has = current.includes(id);
        if (expanded && !has) {
          set({ sidebarExpandedIds: [...current, id] });
        } else if (!expanded && has) {
          set({
            sidebarExpandedIds: current.filter((item) => item !== id),
          });
        }
      },

      syncSidebarToPath: (activeTopId, topLevelIds) => {
        if (!activeTopId) return;
        const current = get().sidebarExpandedIds;
        // Keep non-top-level ids (if any) and force only the active top section open
        const next = [
          ...current.filter((id) => !topLevelIds.includes(id)),
          activeTopId,
        ];
        const same =
          next.length === current.length &&
          next.every((id) => current.includes(id));
        if (!same) {
          set({ sidebarExpandedIds: next });
        }
      },

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "pt-customer-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarExpandedIds: state.sidebarExpandedIds,
        theme: state.theme,
      }),
    },
  ),
);

export { initialState as uiStoreInitialState };
