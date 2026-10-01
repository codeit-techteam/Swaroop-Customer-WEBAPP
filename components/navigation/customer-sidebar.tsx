"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Factory, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { CUSTOMER_NAV, ROUTES, APP_SHORT_NAME } from "@/constants";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarItem } from "@/components/navigation/sidebar-item";
import { SidebarJourney } from "@/components/navigation/sidebar-journey";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import { useNavBadgeCounts } from "@/hooks/use-nav-badge-counts";
import { useImportEnabled, useImportSummary } from "@/hooks/use-import";
import { IMPORT_OWN_SIDE } from "@/lib/import/config";
import { findActiveTopNavId } from "@/lib/nav-active";
import { getInitials, resolveMvpProfile } from "@/lib/profile-display";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

interface CustomerSidebarProps {
  className?: string;
  /** Always show labels (mobile drawer) */
  forceExpanded?: boolean;
}

const FOOTER_NAV_IDS = new Set(["logout"]);

const NAV_SECTIONS: { id: string; title: string; ids: string[] }[] = [
  {
    id: "trade",
    title: "Trade",
    ids: [
      "dashboard",
      "marketplace",
      "purchase-requests",
      "import",
      "onboarding",
    ],
  },
  {
    id: "fulfillment",
    title: "Fulfillment",
    ids: ["orders", "payments", "shipment-tracking"],
  },
  {
    id: "workspace",
    title: "Workspace",
    ids: ["documents", "support"],
  },
];

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
  const user = useAuthStore((s) => s.user);
  const company = useProfileStore((s) => s.company);
  const isCompleted = useOnboardingStore((s) => s.isCompleted);
  const hasStartedOnboarding = useOnboardingStore(
    (s) => s.hasStartedOnboarding,
  );
  const [logoutOpen, setLogoutOpen] = useState(false);

  const collapsed = forceExpanded ? false : sidebarCollapsed;
  const profile = resolveMvpProfile(user, company);

  const navBadgeCounts = useNavBadgeCounts();
  const importEnabled = useImportEnabled();
  const importSummary = useImportSummary();
  const importOwn =
    IMPORT_OWN_SIDE === "BUY"
      ? importSummary.data?.buy
      : importSummary.data?.sell;
  const importAttention =
    (importOwn?.openNegotiations ?? 0) + (importOwn?.pendingDeals ?? 0);
  const badgeCounts = useMemo<Record<string, number>>(
    () => ({ ...navBadgeCounts, import: importAttention }),
    [navBadgeCounts, importAttention],
  );

  const onboardingIncomplete = hasStartedOnboarding && !isCompleted;
  const baseNav = useMemo(
    () =>
      onboardingIncomplete
        ? [ONBOARDING_ONLY_NAV]
        : CUSTOMER_NAV.filter((item) => !FOOTER_NAV_IDS.has(item.id)).map(
            (item) =>
              item.id === "import" && !importEnabled
                ? stripChildren(item)
                : item,
          ),
    [onboardingIncomplete, importEnabled],
  );
  const primaryNav = useMemo(
    () =>
      baseNav.map((item) =>
        item.id in badgeCounts
          ? { ...item, badge: badgeCounts[item.id] }
          : item,
      ),
    [baseNav, badgeCounts],
  );
  const footerNav = CUSTOMER_NAV.filter((item) => FOOTER_NAV_IDS.has(item.id));

  const groupedNav = useMemo(() => {
    const used = new Set<string>();
    const sections = NAV_SECTIONS.map((section) => {
      const items = primaryNav.filter((item) => section.ids.includes(item.id));
      items.forEach((item) => used.add(item.id));
      return { ...section, items };
    }).filter((section) => section.items.length > 0);

    const leftover = primaryNav.filter((item) => !used.has(item.id));
    if (leftover.length) {
      sections.push({
        id: "more",
        title: "More",
        ids: leftover.map((item) => item.id),
        items: leftover,
      });
    }
    return sections;
  }, [primaryNav]);

  useEffect(() => {
    if (onboardingIncomplete || collapsed) return;
    const topLevelIds = baseNav.map((item) => item.id);
    const activeTopId = findActiveTopNavId(pathname, baseNav);
    syncSidebarToPath(activeTopId, topLevelIds);
  }, [pathname, onboardingIncomplete, collapsed, baseNav, syncSidebarToPath]);

  function handleNavigate() {
    setSidebarMobileOpen(false);
  }

  function handleAction(action: "logout") {
    if (action === "logout") setLogoutOpen(true);
  }

  function confirmLogout() {
    setLogoutOpen(false);
    logout();
    window.location.href = ROUTES.login;
  }

  const logoHref = onboardingIncomplete ? ROUTES.onboarding : ROUTES.dashboard;
  const initials = profile.avatarUrl
    ? getInitials(profile.fullName)
    : profile.companyInitials;

  const content = (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(30,111,255,0.22),transparent_55%)]"
      />

      <div className="relative flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3">
        <Link
          href={logoHref}
          className={cn(
            "flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
            collapsed && "mx-auto",
          )}
          onClick={handleNavigate}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white to-brand-50 text-brand shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
            <Factory className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-white">
                {APP_SHORT_NAME}
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
                {onboardingIncomplete ? "Complete setup" : "Customer portal"}
              </span>
            </span>
          ) : null}
        </Link>

        {forceExpanded ? (
          <button
            type="button"
            onClick={() => setSidebarMobileOpen(false)}
            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        {!collapsed && !forceExpanded ? (
          <Tooltip delayDuration={80}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                className="hidden rounded-lg p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue md:inline-flex"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="border-0 bg-brand-800 text-white"
            >
              Collapse sidebar
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      {collapsed ? (
        <div className="relative flex shrink-0 justify-center pb-1">
          <Tooltip delayDuration={80}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                className="rounded-lg p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="border-0 bg-brand-800 text-white"
            >
              Expand sidebar
            </TooltipContent>
          </Tooltip>
        </div>
      ) : null}

      <div className="sidebar-nav-scroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2.5 py-2">
        <nav aria-label="Customer navigation" className="space-y-3">
          {groupedNav.map((section, index) => (
            <div key={section.id}>
              {collapsed ? (
                index > 0 ? (
                  <div className="mx-auto mb-2 h-px w-7 bg-white/10" />
                ) : null
              ) : (
                <p
                  className={cn(
                    "px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35",
                    index === 0 ? "pt-0.5" : "pt-1",
                  )}
                >
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    collapsed={collapsed}
                    siblings={primaryNav}
                    onNavigate={handleNavigate}
                    onAction={handleAction}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="relative shrink-0 space-y-2 border-t border-white/10 px-2.5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {!collapsed && !onboardingIncomplete ? <SidebarJourney /> : null}

        {!collapsed && onboardingIncomplete ? (
          <Link
            href={ROUTES.onboarding}
            onClick={handleNavigate}
            className="block rounded-xl border border-accent-blue/20 bg-accent-blue/15 px-3 py-2.5 transition-colors hover:bg-accent-blue/20"
          >
            <p className="text-[11px] font-semibold text-white">
              Finish onboarding
            </p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-white/60">
              Unlock marketplace, orders, and payments.
            </p>
          </Link>
        ) : null}

        <Link
          href={ROUTES.profile}
          onClick={handleNavigate}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] p-2 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
            collapsed && "justify-center border-0 bg-transparent p-1.5",
          )}
          title={collapsed ? profile.fullName : undefined}
        >
          <Avatar className="h-8 w-8 border border-white/15">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
            ) : null}
            <AvatarFallback className="bg-accent-blue text-[10px] font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-white">
                {profile.fullName}
              </span>
              <span className="block truncate text-[11px] text-white/45">
                {profile.designation}
              </span>
            </span>
          ) : null}
        </Link>

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
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign back in to continue trading on{" "}
              {APP_SHORT_NAME}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay signed in</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  const wrapped = (
    <TooltipProvider delayDuration={120}>
      <div className="relative flex h-full min-h-0 flex-1 flex-col">
        {content}
      </div>
    </TooltipProvider>
  );

  if (forceExpanded) {
    return (
      <aside
        className={cn(
          "relative flex h-full max-h-dvh w-full flex-col overflow-hidden bg-brand",
          className,
        )}
      >
        {wrapped}
      </aside>
    );
  }

  return <Sidebar className={className}>{wrapped}</Sidebar>;
}

/** Keep footer items compact — no nested expanders. */
function stripChildren(item: NavItem): NavItem {
  if (!item.children?.length) return item;
  return { ...item, children: undefined };
}
