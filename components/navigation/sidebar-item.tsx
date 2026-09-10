"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/types";
import { getNavIcon } from "@/components/navigation/nav-icons";
import { NavBadge } from "@/components/navigation/nav-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const isLogout = item.action === "logout";

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
      node.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [showActive, collapsed, pathname]);

  const baseClass = cn(
    "group relative flex w-full select-none items-center rounded-xl text-sm font-medium transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand",
    collapsed ? "justify-center px-0 py-1.5" : "gap-2.5 px-2 py-1.5",
    depth > 0 && !collapsed && "py-1.5 pl-2 text-[13px] font-normal",
  );

  const toneClass = cn(
    showActive &&
      depth === 0 &&
      "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
    showActive && depth > 0 && "bg-accent-blue/15 font-semibold text-white",
    !showActive &&
      isLogout &&
      "text-red-300 hover:bg-red-500/15 hover:text-red-200",
    !showActive &&
      !isLogout &&
      "text-white/70 hover:bg-white/[0.08] hover:text-white",
    item.disabled && "pointer-events-none opacity-50",
  );

  const iconTileClass = cn(
    "relative flex shrink-0 items-center justify-center rounded-lg transition-all duration-200",
    depth === 0 ? "h-8 w-8" : "h-5 w-5",
    showActive && depth === 0 && !isLogout
      ? "bg-accent-blue text-white shadow-sm shadow-accent-blue/40"
      : isLogout
        ? "bg-red-500/15 text-red-300 group-hover:bg-red-500/25"
        : depth === 0
          ? "bg-white/[0.06] text-white/70 group-hover:bg-white/10 group-hover:text-white"
          : "bg-transparent",
  );

  const labelContent = (
    <>
      {showActive && depth === 0 && !collapsed ? (
        <span
          className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-accent-blue"
          aria-hidden
        />
      ) : null}

      {Icon ? (
        <span className={iconTileClass}>
          <Icon className="h-4 w-4" aria-hidden="true" />
          {collapsed && typeof item.badge === "number" && item.badge > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent-blue ring-2 ring-brand" />
          ) : null}
        </span>
      ) : depth > 0 ? (
        <span
          className={cn(
            "ml-1 h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200",
            showActive
              ? "scale-125 bg-accent-blue"
              : "bg-white/30 group-hover:bg-white/60",
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
                "h-5 min-w-5 text-[10px]",
                showActive &&
                  depth === 0 &&
                  "border border-white/20 bg-white/15 text-white",
              )}
            />
          ) : null}
        </>
      ) : null}
    </>
  );

  function wrapTooltip(node: ReactNode) {
    if (!collapsed) return node;
    return (
      <Tooltip delayDuration={80}>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={12}
          className="border-0 bg-brand-800 px-2.5 py-1.5 text-xs font-medium text-white shadow-panel"
        >
          {item.title}
          {typeof item.badge === "number" && item.badge > 0
            ? ` · ${item.badge}`
            : ""}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (item.action) {
    return wrapTooltip(
      <button
        ref={itemRef as React.RefObject<HTMLButtonElement>}
        type="button"
        onClick={() => onAction?.(item.action!)}
        className={cn(baseClass, toneClass)}
        title={collapsed ? item.title : undefined}
        aria-label={item.title}
      >
        {labelContent}
      </button>,
    );
  }

  if (hasChildren && !collapsed) {
    return (
      <div
        ref={itemRef as React.RefObject<HTMLDivElement>}
        className="space-y-0.5"
      >
        <div className={cn(baseClass, toneClass, "pr-1")}>
          {item.href ? (
            <Link
              href={item.href}
              onClick={onNavigate}
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg focus-visible:outline-none"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {labelContent}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => toggleNavExpanded(item.id)}
              className="flex min-w-0 flex-1 items-center gap-2.5"
            >
              {labelContent}
            </button>
          )}
          <button
            type="button"
            onClick={() => toggleNavExpanded(item.id)}
            className={cn(
              "rounded-lg p-1.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
              showActive
                ? "text-white/80 hover:bg-white/10"
                : "text-white/40 hover:bg-white/10 hover:text-white/80",
            )}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.title}`}
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
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
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <ul
                className="ml-[22px] space-y-0.5 border-l border-white/10 pb-1 pl-2.5"
                role="list"
              >
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

  return wrapTooltip(
    <Link
      ref={itemRef as React.RefObject<HTMLAnchorElement>}
      href={item.href}
      onClick={onNavigate}
      className={cn(baseClass, toneClass)}
      aria-current={showActive ? "page" : undefined}
      title={collapsed ? item.title : undefined}
    >
      {labelContent}
    </Link>,
  );
}
