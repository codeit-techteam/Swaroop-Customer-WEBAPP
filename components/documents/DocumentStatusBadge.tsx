"use client";

import { cn } from "@/lib/utils";
import { DOCUMENT_STATUS_LABELS } from "@/constants/documents";
import type { DocumentStatus } from "@/types/documents";

const STATUS_CLASS: Record<DocumentStatus, string> = {
  generated: "bg-sky-50 text-sky-800 border-sky-200",
  downloaded: "bg-indigo-50 text-indigo-800 border-indigo-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  verified: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export function DocumentStatusBadge({
  status,
  className,
}: DocumentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_CLASS[status],
        className,
      )}
    >
      {DOCUMENT_STATUS_LABELS[status]}
    </span>
  );
}
