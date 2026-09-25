"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ComplianceDocument } from "@/types/product-details";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/apiClient";

interface DocumentDownloadsProps {
  documents: ComplianceDocument[];
  productId?: string;
  className?: string;
}

type Envelope<T> = { success: boolean; data: T };

function isProductTechnicalDoc(doc: ComplianceDocument): boolean {
  const title = doc.title.trim().toUpperCase();
  const type = String(doc.type).toLowerCase();
  return (
    type === "tds" ||
    type === "msds" ||
    title.includes("TDS") ||
    title.includes("MSDS") ||
    title.includes("MATERIAL SAFETY") ||
    title.includes("TECHNICAL DATA")
  );
}

export function DocumentDownloads({
  documents,
  productId,
  className,
}: DocumentDownloadsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const visibleDocuments = useMemo(
    () => documents.filter(isProductTechnicalDoc),
    [documents],
  );

  if (visibleDocuments.length === 0) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
          className,
        )}
      >
        <h2 className="text-sm font-semibold text-slate-900">
          Technical Documents (TDS / MSDS)
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          TDS and MSDS will appear here when the supplier uploads them
          (optional).
        </p>
      </section>
    );
  }

  const openDocument = async (doc: ComplianceDocument) => {
    const pid = productId ?? doc.productId;
    if (!pid) {
      toast.error("Document unavailable");
      return;
    }
    setLoadingId(doc.id);
    try {
      const payload = await apiClient.get<
        Envelope<{ url: string; fileName?: string; title?: string }>
      >(`/customer/products/${pid}/documents/${doc.id}/url`);
      const url = payload.data?.url;
      if (!url) throw new Error("DOCUMENT_ACCESS_DENIED");
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success(`${doc.title} opened`, {
        description: "Verified Product Document",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to open document",
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-slate-900">
        Technical Documents
      </h2>
      <p className="mt-0.5 text-xs text-slate-500">
        Verified product documents from PetroTrade
      </p>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {visibleDocuments.map((doc) => (
          <li key={doc.id}>
            <button
              type="button"
              onClick={() => void openDocument(doc)}
              disabled={loadingId === doc.id}
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-left transition-colors hover:border-slate-200 hover:bg-white disabled:opacity-60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                {loadingId === doc.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">
                  {doc.title}
                </span>
                <span className="block truncate text-[11px] text-slate-500">
                  {doc.version ? `v${doc.version} · ` : ""}
                  {doc.description || "Verified Product Document"}
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
