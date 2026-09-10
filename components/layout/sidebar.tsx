"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/uiStore";

export const SIDEBAR_WIDTH_EXPANDED = "w-[272px]";
export const SIDEBAR_WIDTH_COLLAPSED = "w-20";
export const SIDEBAR_PAD_EXPANDED = "md:pl-[272px]";
export const SIDEBAR_PAD_COLLAPSED = "md:pl-20";

interface SidebarProps {
  children?: ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden h-dvh min-h-dvh md:flex md:flex-col",
        "overflow-hidden border-r border-white/10 bg-brand",
        "transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        className,
      )}
    >
      {children}
    </aside>
  );
}
