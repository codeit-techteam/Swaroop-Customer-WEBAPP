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
    <div
      className={cn(
        "flex min-h-dvh w-full max-w-[100vw] overflow-x-hidden bg-background",
        className,
      )}
    >
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        {navbar}
        <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
