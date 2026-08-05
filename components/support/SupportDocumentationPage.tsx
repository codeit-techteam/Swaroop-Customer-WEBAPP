"use client";

import { Download, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { simulatePdfDownload } from "@/lib/document-actions";
import { useSupportStore } from "@/store/supportStore";
import { SupportPageHeader } from "./SupportPageHeader";
import { SupportLoadingSkeleton } from "./SupportModuleShell";

export function SupportDocumentationPage() {
  const isHydrated = useSupportStore((s) => s.isHydrated);
  const docs = useSupportStore((s) => s.docs);
  const globalSearch = useSupportStore((s) => s.globalSearch);
  const openDocPreview = useSupportStore((s) => s.openDocPreview);

  if (!isHydrated) return <SupportLoadingSkeleton />;

  const q = globalSearch.trim().toLowerCase();
  const filtered = q
    ? docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q),
      )
    : docs;

  return (
    <div className="space-y-6">
      <SupportPageHeader
        title="Documentation"
        subtitle="Enterprise guides for GST, purchase, credit, payments, shipment, quality and safety."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((doc) => (
          <Card
            key={doc.id}
            className="group flex flex-col rounded-2xl border-slate-200/80 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <CardContent className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-accent-blue transition-colors group-hover:bg-brand group-hover:text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {doc.category}
                  </p>
                  <h3 className="text-base font-semibold text-brand">
                    {doc.title}
                  </h3>
                </div>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-slate-500">
                {doc.description}
              </p>
              <p className="text-xs text-slate-400">
                {doc.pages} pages · Updated {doc.updatedAt}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => openDocPreview(doc.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-brand hover:bg-brand/90"
                  onClick={() => {
                    simulatePdfDownload(doc.fileName, doc.content);
                    toast.success("Download started", {
                      description: doc.fileName,
                    });
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-slate-400">
          No documentation matches your search.
        </p>
      ) : null}
    </div>
  );
}
