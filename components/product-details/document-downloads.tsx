"use client";

import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import type { ComplianceDocument } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface DocumentDownloadsProps {
  documents: ComplianceDocument[];
  className?: string;
}

export function DocumentDownloads({
  documents,
  className,
}: DocumentDownloadsProps) {
  if (documents.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-slate-900">Downloads</h2>
      <p className="mt-0.5 text-xs text-slate-500">
        Product documents and certificates
      </p>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {documents.map((doc) => (
          <li key={doc.id}>
            <button
              type="button"
              onClick={() =>
                toast.success(`${doc.title} download started`, {
                  description: `${doc.fileName} — mock PDF (frontend only).`,
                })
              }
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-left transition-colors hover:border-slate-200 hover:bg-white"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                <FileText className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">
                  {doc.title}
                </span>
                <span className="block truncate text-[11px] text-slate-500">
                  {doc.description}
                </span>
              </span>
              <Download
                className="h-4 w-4 shrink-0 text-slate-400"
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
