import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TopNavbarProps {
  children?: ReactNode;
  className?: string;
  left?: ReactNode;
  right?: ReactNode;
}

export function TopNavbar({
  children,
  className,
  left,
  right,
}: TopNavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 min-w-0 items-center gap-4 overflow-x-hidden border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/90 md:px-6",
        className,
      )}
    >
      {left}
      <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
      {right}
    </header>
  );
}
