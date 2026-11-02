"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { formatFileSize } from "@/constants/documents";
import { getAccessToken } from "@/lib/auth-session";
import {
  fetchGradeTds,
  fetchGradeTdsDocumentUrl,
  fetchProductTdsDocuments,
  requestGradeTds,
  type GradeTdsDocument,
  type GradeTdsResponse,
} from "@/services/grade-tds";

interface GradeTdsSectionProps {
  /** Prefer product TDS endpoint when set (titles synced to product name). */
  productId?: string;
  /** Used for download/request URLs and as product-TDS fallback. */
  gradeId?: string;
}

function requireLogin(router: ReturnType<typeof useRouter>, message: string) {
  const next = `${window.location.pathname}${window.location.search}`;
  toast.message(message);
  router.push(`${ROUTES.login}?next=${encodeURIComponent(next)}`);
}

function docSubtitle(doc: GradeTdsDocument): string {
  const parts: string[] = [];
  if (doc.manufacturer) parts.push(doc.manufacturer);
  if (doc.format && doc.format !== "other") {
    parts.push(String(doc.format).toUpperCase());
  }
  if (doc.fileSizeBytes != null && doc.fileSizeBytes > 0) {
    parts.push(formatFileSize(doc.fileSizeBytes));
  }
  if (doc.revision != null) parts.push(`Rev ${doc.revision}`);
  return parts.join(" · ") || "Verified technical data sheet";
}

export function GradeTdsSection({ productId, gradeId }: GradeTdsSectionProps) {
  const router = useRouter();
  const [data, setData] = useState<GradeTdsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const resolvedGradeId = data?.grade?.id || gradeId || "";

  useEffect(() => {
    if (!productId && !gradeId) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setRequested(false);
    const load = productId
      ? fetchProductTdsDocuments(productId, { gradeId })
      : fetchGradeTds(gradeId!);
    void load
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) {
          setData({
            grade: { id: gradeId ?? "", code: "", name: "" },
            available: false,
            message: "TDS unavailable",
            canRequest: Boolean(gradeId),
            items: [],
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gradeId, productId]);

  async function openDoc(doc: GradeTdsDocument, mode: "view" | "download") {
    if (!getAccessToken()) {
      requireLogin(router, "Sign in to download TDS");
      return;
    }
    if (!resolvedGradeId) {
      toast.error("TDS unavailable");
      return;
    }
    setBusyId(doc.id);
    const loadingId = toast.loading(
      mode === "download" ? "Preparing download…" : "Opening TDS…",
    );
    try {
      const payload = await fetchGradeTdsDocumentUrl(resolvedGradeId, doc.id);
      if (!payload.url) {
        toast.error("TDS unavailable", { id: loadingId });
        return;
      }
      if (mode === "download") {
        const anchor = document.createElement("a");
        anchor.href = payload.url;
        anchor.download =
          payload.fileName || doc.fileName || `${doc.title || "TDS"}.pdf`;
        anchor.rel = "noopener noreferrer";
        anchor.target = "_blank";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        toast.success("Download started", {
          id: loadingId,
          description: doc.title ?? "Technical Data Sheet",
        });
      } else {
        const opened = window.open(
          payload.url,
          "_blank",
          "noopener,noreferrer",
        );
        if (!opened) {
          toast.message("Allow pop-ups to view the TDS", { id: loadingId });
          window.location.assign(payload.url);
          return;
        }
        toast.success("Opened in a new tab", {
          id: loadingId,
          description: doc.title ?? "Technical Data Sheet",
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "TDS unavailable", {
        id: loadingId,
      });
    } finally {
      setBusyId(null);
    }
  }

  async function onRequestTds() {
    if (!getAccessToken()) {
      requireLogin(router, "Sign in to request TDS");
      return;
    }
    if (!resolvedGradeId) {
      toast.error("Unable to request TDS");
      return;
    }
    setRequesting(true);
    try {
      const result = await requestGradeTds(resolvedGradeId);
      setRequested(true);
      toast.success(
        result.alreadyExists
          ? "TDS request already on file"
          : "TDS request submitted",
        {
          description: result.referenceNumber
            ? `Reference ${result.referenceNumber}`
            : undefined,
        },
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to request TDS",
      );
    } finally {
      setRequesting(false);
    }
  }

  if (!productId && !gradeId) return null;

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading TDS…
        </div>
      </section>
    );
  }

  const available = Boolean(data?.available && data.items.length);
  const canRequest = Boolean(data?.canRequest ?? resolvedGradeId) && !requested;

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-brand" aria-hidden />
        <h2 className="text-sm font-semibold text-slate-900">
          Technical Data Sheet (TDS)
        </h2>
        {available ? (
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Available
          </span>
        ) : null}
      </div>

      {available ? (
        <ul className="space-y-2">
          {data!.items.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  {doc.title ?? "Technical Data Sheet"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {docSubtitle(doc)}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg"
                  disabled={busyId === doc.id}
                  onClick={() => void openDoc(doc, "view")}
                >
                  {busyId === doc.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  View
                </Button>
                <Button
                  size="sm"
                  className="h-8 rounded-lg bg-brand hover:bg-brand-700"
                  disabled={busyId === doc.id}
                  onClick={() => void openDoc(doc, "download")}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            {data?.message?.trim() ||
              "Technical Data Sheet is currently unavailable for this grade."}
          </p>
          {canRequest ? (
            <Button
              size="sm"
              className="h-9 rounded-lg bg-brand hover:bg-brand-700"
              disabled={requesting}
              onClick={() => void onRequestTds()}
            >
              {requesting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )}
              Request TDS
            </Button>
          ) : requested ? (
            <p className="text-xs font-medium text-slate-600">
              Your TDS request has been submitted. We will notify you when it is
              available.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
