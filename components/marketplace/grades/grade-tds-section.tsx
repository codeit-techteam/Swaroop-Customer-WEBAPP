"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { getAccessToken } from "@/lib/auth-session";
import {
  fetchGradeTds,
  fetchProductDocumentUrl,
  type GradeTdsDocument,
  type GradeTdsResponse,
} from "@/services/grade-tds";

interface GradeTdsSectionProps {
  gradeId: string;
}

export function GradeTdsSection({ gradeId }: GradeTdsSectionProps) {
  const router = useRouter();
  const [data, setData] = useState<GradeTdsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchGradeTds(gradeId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) {
          setData({
            grade: { id: gradeId, code: "", name: "" },
            available: false,
            message: "TDS unavailable",
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
  }, [gradeId]);

  async function openDoc(doc: GradeTdsDocument, mode: "view" | "download") {
    const productId = doc.productId;
    if (!productId) {
      toast.error("TDS unavailable");
      return;
    }
    if (!getAccessToken()) {
      const next = `${window.location.pathname}${window.location.search}`;
      toast.message("Sign in to download TDS");
      router.push(`${ROUTES.login}?next=${encodeURIComponent(next)}`);
      return;
    }
    setBusyId(doc.id);
    try {
      const payload = await fetchProductDocumentUrl(productId, doc.id);
      if (!payload.url) {
        toast.error("TDS unavailable");
        return;
      }
      window.open(payload.url, "_blank", "noopener,noreferrer");
      toast.success(
        mode === "download" ? "TDS download started" : "TDS opened",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "TDS unavailable");
    } finally {
      setBusyId(null);
    }
  }

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

  const unavailable = !data?.available || !data.items.length;

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-brand" aria-hidden />
        <h2 className="text-sm font-semibold text-slate-900">
          Technical Data Sheet (TDS)
        </h2>
      </div>
      {unavailable ? (
        <p className="text-sm text-slate-500">
          {data?.message?.trim() || "TDS unavailable"}
        </p>
      ) : (
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
                  {[doc.productName, doc.productCode]
                    .filter(Boolean)
                    .join(" · ") || "Verified product document"}
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
      )}
    </section>
  );
}
