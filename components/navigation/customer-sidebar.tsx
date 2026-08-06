"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { CUSTOMER_NAV, ROUTES, APP_SHORT_NAME } from "@/constants";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarItem } from "@/components/navigation/sidebar-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { findActiveTopNavId } from "@/lib/nav-active";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

interface CustomerSidebarProps {
  className?: string;
  /** Always show labels (mobile drawer) */
  forceExpanded?: boolean;
}

const FOOTER_NAV_IDS = new Set(["logout"]);

const ONBOARDING_ONLY_NAV: NavItem = {
  id: "onboarding",
  title: "Onboarding Progress",
  href: ROUTES.onboarding,
  icon: "ClipboardList",
};

export function CustomerSidebar({
  className,
  forceExpanded = false,
}: CustomerSidebarProps) {
  const pathname = usePathname();
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const setSidebarMobileOpen = useUiStore((s) => s.setSidebarMobileOpen);
  const syncSidebarToPath = useUiStore((s) => s.syncSidebarToPath);
  const logout = useAuthStore((s) => s.logout);
  const isCompleted = useOnboardingStore((s) => s.isCompleted);
  const hasStartedOnboarding = useOnboardingStore(
    (s) => s.hasStartedOnboarding,
  );

  const collapsed = forceExpanded ? false : sidebarCollapsed;

  const onboardingIncomplete = hasStartedOnboarding && !isCompleted;
  const primaryNav = useMemo(
    () =>
      onboardingIncomplete
        ? [ONBOARDING_ONLY_NAV]
        : CUSTOMER_NAV.filter((item) => !FOOTER_NAV_IDS.has(item.id)),
    [onboardingIncomplete],
  );
  const footerNav = CUSTOMER_NAV.filter((item) => FOOTER_NAV_IDS.has(item.id));

  useEffect(() => {
    if (onboardingIncomplete || collapsed) return;
    const topLevelIds = primaryNav.map((item) => item.id);
    const activeTopId = findActiveTopNavId(pathname, primaryNav);
    syncSidebarToPath(activeTopId, topLevelIds);
  }, [
    pathname,
    onboardingIncomplete,
    collapsed,
    primaryNav,
    syncSidebarToPath,
  ]);

  function handleNavigate() {
    setSidebarMobileOpen(false);
  }

  function handleAction(action: "logout") {
    if (action === "logout") {
      logout();
      window.location.href = ROUTES.login;
    }
  }

  const logoHref = onboardingIncomplete ? ROUTES.onboarding : ROUTES.dashboard;

  const content = (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3">
        <Link
          href={logoHref}
          className={cn(
            "flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            collapsed && "mx-auto",
          )}
          onClick={handleNavigate}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
            PT
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight text-brand">
                {APP_SHORT_NAME}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {onboardingIncomplete
                  ? "Complete Onboarding"
                  : "Enterprise Trading"}
              </span>
            </span>
          ) : null}
        </Link>

        {!collapsed && !forceExpanded ? (
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="hidden rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:inline-flex"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <div className="flex shrink-0 justify-center border-b border-slate-100 py-2">
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <ScrollArea className="min-h-0 flex-1 px-2 py-3">
        <nav aria-label="Customer navigation" className="space-y-0.5">
          {primaryNav.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              siblings={primaryNav}
              onNavigate={handleNavigate}
              onAction={handleAction}
            />
          ))}
        </nav>
      </ScrollArea>

      <div className="shrink-0 border-t border-slate-200 px-2 py-3">
        <nav aria-label="Account" className="space-y-0.5">
          {footerNav.map((item) => (
            <SidebarItem
              key={item.id}
              item={stripChildren(item)}
              collapsed={collapsed}
              onNavigate={handleNavigate}
              onAction={handleAction}
            />
          ))}
        </nav>
        {!collapsed ? (
          <p className="mt-3 px-2 text-[10px] leading-relaxed text-slate-400">
            {onboardingIncomplete
              ? "Finish onboarding to unlock trading modules"
              : "Purchase Request → Order → Payment → Shipment"}
          </p>
        ) : null}
      </div>
    </>
  );

  if (forceExpanded) {
    return (
      <aside className={cn("flex h-full w-full flex-col bg-white", className)}>
        {content}
      </aside>
    );
  }

  return <Sidebar className={cn("bg-white", className)}>{content}</Sidebar>;
}

/** Keep footer items compact — no nested expanders. */
function stripChildren(item: NavItem): NavItem {
  if (!item.children?.length) return item;
  return { ...item, children: undefined };
}
