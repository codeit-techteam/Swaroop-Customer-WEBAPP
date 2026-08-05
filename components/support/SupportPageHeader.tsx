"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSupportStore } from "@/store/supportStore";
import { SupportMobileNav } from "./SupportSidebar";
import { cn } from "@/lib/utils";

interface SupportPageHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
  hideSearch?: boolean;
}

export function SupportPageHeader({
  title = "How can we help you today?",
  subtitle = "Search support articles, payment issues, shipment tracking and technical assistance.",
  className,
  hideSearch,
}: SupportPageHeaderProps) {
  const globalSearch = useSupportStore((s) => s.globalSearch);
  const setGlobalSearch = useSupportStore((s) => s.setGlobalSearch);
  const setFilters = useSupportStore((s) => s.setFilters);

  return (
    <div className={cn("space-y-4", className)}>
      <SupportMobileNav />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-brand md:text-[1.75rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm leading-relaxed text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {!hideSearch ? (
          <div className="relative w-full max-w-md shrink-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={globalSearch}
              onChange={(e) => {
                const v = e.target.value;
                setGlobalSearch(v);
                setFilters({ search: v });
              }}
              placeholder="Search for help articles, tickets, FAQs..."
              className="h-11 rounded-full border-slate-200 bg-white pl-10 shadow-sm"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
