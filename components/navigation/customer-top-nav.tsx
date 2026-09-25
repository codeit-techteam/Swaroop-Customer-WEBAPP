"use client";

import Link from "next/link";
import { Bell, Menu, ShoppingCart } from "lucide-react";
import { ROUTES } from "@/constants";
import { TopNavbar } from "@/components/layout/top-navbar";
import { LocationSelector } from "@/components/location/location-selector";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { ProfileAvatarButton } from "@/components/profile/ProfileAvatarButton";
import { GlobalGradeSearch } from "@/components/search/global-grade-search";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { useNotificationStore } from "@/store/notificationStore";
import { cn } from "@/lib/utils";

interface CustomerTopNavProps {
  className?: string;
}

export function CustomerTopNav({ className }: CustomerTopNavProps) {
  const toggleSidebarMobile = useUiStore((s) => s.toggleSidebarMobile);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isPanelOpen = useNotificationStore((s) => s.isPanelOpen);
  const setPanelOpen = useNotificationStore((s) => s.setPanelOpen);
  const cartCount = useCartStore((s) => s.items.length);

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
            <LocationSelector />

            <Button
              asChild
              className="hidden h-10 rounded-xl bg-brand px-3 text-sm font-semibold hover:bg-brand-700 sm:inline-flex sm:px-4"
            >
              <Link href={ROUTES.marketplace}>
                <span className="hidden lg:inline">Browse Marketplace</span>
                <span className="lg:hidden">Marketplace</span>
              </Link>
            </Button>

            <Link
              href={ROUTES.cart}
              className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Link>

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
        <GlobalGradeSearch />
      </TopNavbar>
      <NotificationDrawer open={isPanelOpen} onOpenChange={setPanelOpen} />
    </>
  );
}
