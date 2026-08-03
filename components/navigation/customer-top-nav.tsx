"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Menu, Search, Settings } from "lucide-react";
import { ROUTES } from "@/constants";
import { TopNavbar } from "@/components/layout/top-navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
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
  const user = useAuthStore((s) => s.user);
  const toggleSidebarMobile = useUiStore((s) => s.toggleSidebarMobile);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const search = useMarketplaceStore((s) => s.search);
  const setSearch = useMarketplaceStore((s) => s.setSearch);
  const initials = getInitials(user?.name ?? "Customer");

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(ROUTES.marketplace);
  };

  return (
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
              <span className="hidden lg:inline">Create Purchase Request</span>
              <span className="lg:hidden">Purchase Request</span>
            </Link>
          </Button>

          <Link
            href={ROUTES.notifications}
            className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" />
            ) : null}
          </Link>

          <Link
            href={ROUTES.settings}
            className="hidden rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:inline-flex"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>

          <Link
            href={ROUTES.profile}
            className="flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Avatar className="h-9 w-9 border border-slate-200">
              <AvatarFallback className="bg-brand text-xs font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
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
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
