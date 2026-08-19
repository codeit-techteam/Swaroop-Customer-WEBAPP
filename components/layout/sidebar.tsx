"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/uiStore";

interface SidebarProps {
  children?: ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 hidden h-dvh max-h-dvh shrink-0 self-start overflow-hidden border-r border-slate-200 bg-card transition-[width] duration-200 md:flex md:flex-col",
        sidebarCollapsed ? "w-[72px]" : "w-64",
        className,
      )}
    >
      {children}
    </aside>
  );
}
