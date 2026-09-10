import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  navbar?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function AppShell({
  children,
  sidebar,
  navbar,
  className,
  contentClassName,
}: AppShellProps) {
  return (
    <div className={cn("min-h-dvh w-full bg-background", className)}>
      {sidebar}
      <div
        className={cn(
          "flex min-h-dvh min-w-0 flex-col",
          contentClassName,
        )}
      >
        {navbar}
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
