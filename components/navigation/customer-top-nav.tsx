"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";
import { ROUTES } from "@/constants";
import { TopNavbar } from "@/components/layout/top-navbar";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { ProfileAvatarButton } from "@/components/profile/ProfileAvatarButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/store/uiStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import { cn } from "@/lib/utils";

interface CustomerTopNavProps {
  className?: string;
}

const TOP_LINKS = [
  { label: "Market Data", href: ROUTES.marketplace },
  { label: "Insights", href: `${ROUTES.marketplaceOffers}` },
  { label: "Help Center", href: ROUTES.support },
] as const;

export function CustomerTopNav({ className }: CustomerTopNavProps) {
  const router = useRouter();
  const toggleSidebarMobile = useUiStore((s) => s.toggleSidebarMobile);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isPanelOpen = useNotificationStore((s) => s.isPanelOpen);
  const setPanelOpen = useNotificationStore((s) => s.setPanelOpen);
  const search = useMarketplaceStore((s) => s.search);
  const setSearch = useMarketplaceStore((s) => s.setSearch);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(ROUTES.marketplace);
  };

  return (
    <>
      <TopNavbar
        className={cn("bg-white", className)}
        left={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebarMobile}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        }
        right={
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <Button
              asChild
              className="hidden h-10 rounded-xl bg-brand px-3 text-sm font-semibold hover:bg-brand-700 sm:inline-flex sm:px-4"
            >
              <Link href={ROUTES.purchaseRequestsCreate}>
                <span className="hidden lg:inline">
                  Create Purchase Request
                </span>
                <span className="lg:hidden">Purchase Request</span>
              </Link>
            </Button>

            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-blue px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </button>

            <ProfileAvatarButton />
          </div>
        }
      >
        <div className="flex flex-1 items-center gap-4 lg:gap-8">
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden max-w-md flex-1 md:block"
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search grades, warehouses..."
              className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9"
              aria-label="Search materials"
            />
          </form>

          <nav
            aria-label="Secondary"
            className="hidden items-center gap-5 xl:flex"
          >
            {TOP_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-500 transition-colors hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </TopNavbar>

      <NotificationDrawer open={isPanelOpen} onOpenChange={setPanelOpen} />
    </>
  );
}
