"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const JOURNEY_STEPS = [
  { id: "pr", label: "PR", match: "/purchase-requests" },
  { id: "order", label: "Order", match: "/orders" },
  { id: "pay", label: "Pay", match: "/payments" },
  { id: "ship", label: "Ship", match: "/shipment" },
] as const;

function isStepActive(pathname: string, match: string) {
  return pathname === match || pathname.startsWith(`${match}/`);
}

interface SidebarJourneyProps {
  className?: string;
}

export function SidebarJourney({ className }: SidebarJourneyProps) {
  const pathname = usePathname();
  const activeIndex = JOURNEY_STEPS.findIndex((step) =>
    isStepActive(pathname, step.match),
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5",
        className,
      )}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
        Order flow
      </p>
      <div className="flex items-center gap-1">
        {JOURNEY_STEPS.map((step, index) => {
          const active = index === activeIndex;
          const passed = activeIndex >= 0 && index < activeIndex;

          return (
            <div key={step.id} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex h-1.5 w-1.5 rounded-full transition-all duration-300",
                    active &&
                      "h-2 w-2 bg-accent-blue shadow-[0_0_10px_rgba(30,111,255,0.7)]",
                    passed && "bg-accent-blue/70",
                    !active && !passed && "bg-white/25",
                  )}
                />
                <span
                  className={cn(
                    "truncate text-[9px] font-semibold uppercase tracking-wide",
                    active ? "text-white" : "text-white/45",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < JOURNEY_STEPS.length - 1 ? (
                <span
                  className={cn(
                    "mb-3 h-px w-full min-w-2 max-w-5 flex-1 rounded-full transition-colors duration-300",
                    passed || active ? "bg-accent-blue/50" : "bg-white/15",
                  )}
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
