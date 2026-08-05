"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Library,
  LifeBuoy,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SUPPORT_NAV, SUPPORT_ROUTES } from "@/constants/support";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { computeOpenTicketCount, useSupportStore } from "@/store/supportStore";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Ticket,
  MessageSquare,
  BookOpen,
  Library,
};

export function SupportSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const tickets = useSupportStore((s) => s.tickets);
  const setRaiseTicketOpen = useSupportStore((s) => s.setRaiseTicketOpen);
  const openCount = computeOpenTicketCount(tickets);

  function isActive(href: string) {
    if (href === SUPPORT_ROUTES.root) {
      return pathname === SUPPORT_ROUTES.root;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white shadow-sm">
            <LifeBuoy className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-brand">
              Support Center
            </p>
            <p className="text-[11px] font-medium text-slate-400">
              Enterprise Portal
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <Button
          className="h-11 w-full justify-start gap-2 rounded-xl bg-brand text-sm font-semibold shadow-sm hover:bg-brand/90"
          onClick={() => setRaiseTicketOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Raise New Ticket
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pb-4" aria-label="Support">
        {SUPPORT_NAV.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
          const active = isActive(item.href);
          const badge =
            item.badgeKey === "openTickets" && openCount > 0 ? openCount : null;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sky-50 text-brand"
                  : "text-slate-600 hover:bg-slate-50 hover:text-brand",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active
                    ? "text-accent-blue"
                    : "text-slate-400 group-hover:text-brand",
                )}
              />
              <span className="flex-1">{item.title}</span>
              {badge ? (
                <Badge className="h-5 min-w-5 justify-center rounded-full bg-brand px-1.5 text-[10px] text-white hover:bg-brand">
                  {badge}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-0.5 px-3 pb-4">
        <Separator className="mb-3" />
        <button
          type="button"
          onClick={() => router.push(SUPPORT_ROUTES.settings)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
            isActive(SUPPORT_ROUTES.settings)
              ? "bg-sky-50 text-brand"
              : "text-slate-600 hover:bg-slate-50 hover:text-brand",
          )}
        >
          <Settings className="h-4 w-4 text-slate-400" />
          Settings
        </button>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push(ROUTES.login);
          }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          Logout
        </button>
      </div>
    </aside>
  );
}

/** Compact horizontal nav for tablet / mobile within Support module */
export function SupportMobileNav() {
  const pathname = usePathname();
  const tickets = useSupportStore((s) => s.tickets);
  const setRaiseTicketOpen = useSupportStore((s) => s.setRaiseTicketOpen);
  const openCount = computeOpenTicketCount(tickets);

  return (
    <div className="mb-4 space-y-3 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand">Support Center</p>
          <p className="text-xs text-slate-400">Enterprise Portal</p>
        </div>
        <Button
          size="sm"
          className="rounded-xl bg-brand hover:bg-brand/90"
          onClick={() => setRaiseTicketOpen(true)}
        >
          <Plus className="mr-1 h-4 w-4" />
          New Ticket
        </Button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {SUPPORT_NAV.map((item) => {
          const active =
            item.href === SUPPORT_ROUTES.root
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "bg-brand text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-brand",
              )}
            >
              {item.title}
              {item.badgeKey === "openTickets" && openCount > 0
                ? ` (${openCount})`
                : ""}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
