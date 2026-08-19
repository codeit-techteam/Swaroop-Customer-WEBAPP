"use client";

import { cn } from "@/lib/utils";

interface ProductApplicationsProps {
  applications: string[];
  industry?: string;
  className?: string;
}

export function ProductApplications({
  applications,
  industry,
  className,
}: ProductApplicationsProps) {
  if (applications.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-slate-900">
        Common Applications
      </h2>
      {industry ? (
        <p className="mt-0.5 text-xs text-slate-500">{industry}</p>
      ) : null}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {applications.map((app) => (
          <div
            key={app}
            className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-sm font-medium text-slate-800"
          >
            {app}
          </div>
        ))}
      </div>
    </section>
  );
}
