"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { CUSTOMER_NAV, ROUTES, APP_SHORT_NAME } from "@/constants";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarItem } from "@/components/navigation/sidebar-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

interface CustomerSidebarProps {
  className?: string;
  /** Always show labels (mobile drawer) */
  forceExpanded?: boolean;
}

const FOOTER_NAV_IDS = new Set(["notifications", "profile", "logout"]);

export function CustomerSidebar({
  className,
  forceExpanded = false,
}: CustomerSidebarProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const setSidebarMobileOpen = useUiStore((s) => s.setSidebarMobileOpen);
  const logout = useAuthStore((s) => s.logout);

  const collapsed = forceExpanded ? false : sidebarCollapsed;

  const primaryNav = CUSTOMER_NAV.filter(
    (item) => !FOOTER_NAV_IDS.has(item.id),
  );
  const footerNav = CUSTOMER_NAV.filter((item) => FOOTER_NAV_IDS.has(item.id));

  function handleNavigate() {
    setSidebarMobileOpen(false);
  }

  function handleAction(action: "logout") {
    if (action === "logout") {
      logout();
      window.location.href = ROUTES.login;
    }
  }

  const content = (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3">
        <Link
          href={ROUTES.dashboard}
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
                Enterprise Trading
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
            Marketplace → Purchase Request → Order → Payment → Shipment
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
