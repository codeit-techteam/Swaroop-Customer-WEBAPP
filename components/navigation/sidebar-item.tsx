"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/types";
import { getNavIcon } from "@/components/navigation/nav-icons";
import { NavBadge } from "@/components/navigation/nav-badge";
import { useUiStore } from "@/store/uiStore";
import {
  isNavItemActive,
  isNavBranchActive,
  isSectionPath,
} from "@/lib/nav-active";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  item: NavItem;
  depth?: number;
  collapsed?: boolean;
  siblings?: NavItem[];
  onNavigate?: () => void;
  onAction?: (action: NonNullable<NavItem["action"]>) => void;
}

export function SidebarItem({
  item,
  depth = 0,
  collapsed = false,
  siblings,
  onNavigate,
  onAction,
}: SidebarItemProps) {
  const pathname = usePathname();
  const expandedIds = useUiStore((s) => s.sidebarExpandedIds);
  const toggleNavExpanded = useUiStore((s) => s.toggleNavExpanded);
  const itemRef = useRef<
    HTMLDivElement | HTMLAnchorElement | HTMLButtonElement
  >(null);

  const hasChildren = Boolean(item.children?.length);
  const isExpanded = expandedIds.includes(item.id);
  const Icon = getNavIcon(item.icon);

  const isLeafActive = isNavItemActive(pathname, item, siblings);
  const isChildActive = hasChildren && isNavBranchActive(pathname, item);
  const isParentRootActive =
    Boolean(item.href) &&
    hasChildren &&
    (pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(`${item.href}/`)) ||
      isSectionPath(pathname, item));

  const showActive =
    depth === 0
      ? isLeafActive || isChildActive || isParentRootActive
      : isLeafActive;

  useEffect(() => {
    if (!showActive || collapsed) return;
    const node = itemRef.current;
    if (!node) return;
    const frame = window.requestAnimationFrame(() => {
      // inline: "nearest" prevents horizontal page jump when focusing active nav
      node.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [showActive, collapsed, pathname]);

  const baseClass = cn(
    "group flex w-full items-center gap-3 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
    collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
    depth > 0 && !collapsed && "py-2 pl-10 text-[13px] font-normal",
  );

  const toneClass = cn(
    showActive && depth === 0 && "bg-brand text-white shadow-sm",
    showActive && depth > 0 && "bg-brand/10 font-semibold text-brand",
    !showActive && item.action === "logout" && "text-red-600 hover:bg-red-50",
    !showActive &&
      item.action !== "logout" &&
      "text-slate-700 hover:bg-slate-100",
    item.disabled && "pointer-events-none opacity-50",
  );

  const iconClass = cn(
    "h-[18px] w-[18px] shrink-0",
    showActive && depth === 0
      ? "text-white"
      : showActive
        ? "text-brand"
        : item.action === "logout"
          ? "text-red-500"
          : "text-slate-500",
  );

  const labelContent = (
    <>
      {Icon ? (
        <Icon className={iconClass} aria-hidden="true" />
      ) : depth > 0 ? (
        <span
          className={cn(
            "ml-1 h-1.5 w-1.5 shrink-0 rounded-full",
            showActive ? "bg-brand" : "bg-slate-300",
          )}
          aria-hidden="true"
        />
      ) : null}

      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate text-left">
            {item.title}
          </span>
          {typeof item.badge === "number" && item.badge > 0 ? (
            <NavBadge
              count={item.badge}
              variant={item.badgeVariant}
              className={cn(
                showActive && depth === 0 && "bg-white/20 text-white",
              )}
            />
          ) : null}
        </>
      ) : null}
    </>
  );

  if (item.action) {
    return (
      <button
        ref={itemRef as React.RefObject<HTMLButtonElement>}
        type="button"
        onClick={() => onAction?.(item.action!)}
        className={cn(baseClass, toneClass)}
        title={collapsed ? item.title : undefined}
        aria-label={item.title}
      >
        {labelContent}
      </button>
    );
  }

  if (hasChildren && !collapsed) {
    return (
      <div
        ref={itemRef as React.RefObject<HTMLDivElement>}
        className="space-y-0.5"
      >
        <div className={cn(baseClass, toneClass, "gap-1 pr-1.5")}>
          {item.href ? (
            <Link
              href={item.href}
              onClick={onNavigate}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {labelContent}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => toggleNavExpanded(item.id)}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              {labelContent}
            </button>
          )}
          <button
            type="button"
            onClick={() => toggleNavExpanded(item.id)}
            className={cn(
              "rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              showActive && depth === 0
                ? "text-white/80 hover:bg-white/10"
                : "text-slate-400 hover:bg-slate-200/60 hover:text-slate-600",
            )}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.title}`}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              key={`${item.id}-children`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <ul className="space-y-0.5 pb-1" role="list">
                {item.children!.map((child) => (
                  <li key={child.id}>
                    <SidebarItem
                      item={child}
                      depth={depth + 1}
                      collapsed={false}
                      siblings={item.children}
                      onNavigate={onNavigate}
                      onAction={onAction}
                    />
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }

  if (!item.href) return null;

  return (
    <Link
      ref={itemRef as React.RefObject<HTMLAnchorElement>}
      href={item.href}
      onClick={onNavigate}
      className={cn(baseClass, toneClass)}
      aria-current={showActive ? "page" : undefined}
      title={collapsed ? item.title : undefined}
    >
      {labelContent}
    </Link>
  );
}
