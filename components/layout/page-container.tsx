import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1400px] min-w-0 space-y-6 overflow-x-hidden p-4 md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
