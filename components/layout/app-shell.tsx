import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  navbar?: ReactNode;
  className?: string;
}

export function AppShell({
  children,
  sidebar,
  navbar,
  className,
}: AppShellProps) {
  return (
    <div className={cn("flex min-h-screen bg-background", className)}>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {navbar}
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
