"use client";

import { Download, Expand, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { printDocumentHtml, simulatePdfDownload } from "@/lib/document-actions";
import { useSupportStore } from "@/store/supportStore";

export function SupportDocPreviewModal() {
  const preview = useSupportStore((s) => s.docPreview);
  const closeDocPreview = useSupportStore((s) => s.closeDocPreview);

  if (!preview) return null;

  return (
    <Dialog
      open={preview.open}
      onOpenChange={(open) => {
        if (!open) closeDocPreview();
      }}
    >
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-6">
            <DialogTitle className="text-lg text-brand">
              {preview.title}
            </DialogTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() => {
                  simulatePdfDownload(preview.fileName, preview.content);
                  toast.success("Download started", {
                    description: preview.fileName,
                  });
                }}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() =>
                  printDocumentHtml(preview.title, preview.content)
                }
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto bg-slate-50 p-5">
          <div className="mx-auto min-h-[420px] max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-400">
              <Expand className="h-3.5 w-3.5" />
              Document preview · PetroTrade Enterprise
            </div>
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-700">
              {preview.content}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
