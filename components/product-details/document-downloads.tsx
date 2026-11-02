"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ComplianceDocument } from "@/types/product-details";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { getAccessToken } from "@/lib/auth-session";
import { fetchProductDocumentUrl } from "@/services/grade-tds";

interface DocumentDownloadsProps {
  documents: ComplianceDocument[];
  productId?: string;
  className?: string;
}

/** Listing-specific docs only — grade-library TDS is shown via GradeTdsSection. */
function isListingSecondaryDoc(doc: ComplianceDocument): boolean {
  const title = doc.title.trim().toUpperCase();
  const type = String(doc.type).toLowerCase();
  const isTds =
    type === "tds" ||
    type === "product_tds" ||
    title.includes("TDS") ||
    title.includes("TECHNICAL DATA");
  if (isTds) return false;
  return (
    type === "msds" ||
    title.includes("MSDS") ||
    title.includes("MATERIAL SAFETY") ||
    type === "coa" ||
    type === "iso" ||
    type === "other" ||
    title.includes("CERTIFICATE") ||
    title.includes("SPECIFICATION")
  );
}

export function DocumentDownloads({
  documents,
  productId,
  className,
}: DocumentDownloadsProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const visibleDocuments = useMemo(
    () => documents.filter(isListingSecondaryDoc),
    [documents],
  );

  if (visibleDocuments.length === 0) {
    return null;
  }

  const openDocument = async (doc: ComplianceDocument) => {
    const pid = productId ?? doc.productId;
    if (!pid) {
      toast.error("Document unavailable");
      return;
    }
    if (!getAccessToken()) {
      const next = `${window.location.pathname}${window.location.search}`;
      toast.message("Sign in to download documents", {
        description: "You will return to this product after login.",
      });
      router.push(`${ROUTES.login}?next=${encodeURIComponent(next)}`);
      return;
    }
    setLoadingId(doc.id);
    try {
      const payload = await fetchProductDocumentUrl(pid, doc.id);
      if (!payload.url) throw new Error("Document unavailable");
      window.open(payload.url, "_blank", "noopener,noreferrer");
      toast.success(`${doc.title} opened`, {
        description: "Verified Product Document",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Document unavailable",
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
        Additional Documents
      </h2>
      <p className="mt-0.5 text-xs text-slate-500">
        Listing-specific MSDS and related documents
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
