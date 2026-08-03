"use client";

import { useState } from "react";
import {
  Download,
  Expand,
  Minimize2,
  Printer,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { printDocumentHtml, simulatePdfDownload } from "@/lib/document-actions";
import { useDocumentsStore } from "@/store/documentsStore";
import { cn } from "@/lib/utils";

export function DocumentPreviewModal() {
  const preview = useDocumentsStore((s) => s.preview);
  const closePreview = useDocumentsStore((s) => s.closePreview);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const open = !!preview?.open;

  const handleClose = (next: boolean) => {
    if (!next) {
      closePreview();
      setZoom(100);
      setRotation(0);
      setFullscreen(false);
    }
  };

  if (!preview) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden rounded-2xl p-0",
          fullscreen
            ? "h-[96vh] w-[96vw] max-w-none"
            : "max-h-[90vh] w-full max-w-4xl",
        )}
      >
        <DialogHeader className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="text-lg text-brand">
                {preview.title}
              </DialogTitle>
              <p className="mt-1 text-xs text-slate-500">
                {preview.subtitle ??
                  [
                    preview.documentNumber,
                    preview.orderNumber,
                    preview.categoryLabel,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <ToolbarButton
                label="Zoom out"
                onClick={() => setZoom((z) => Math.max(70, z - 10))}
              >
                <ZoomOut className="h-4 w-4" />
              </ToolbarButton>
              <span className="min-w-[3rem] text-center text-xs font-medium text-slate-600">
                {zoom}%
              </span>
              <ToolbarButton
                label="Zoom in"
                onClick={() => setZoom((z) => Math.min(160, z + 10))}
              >
                <ZoomIn className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Rotate"
                onClick={() => setRotation((r) => (r + 90) % 360)}
              >
                <RotateCw className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Download"
                onClick={() => {
                  simulatePdfDownload(preview.fileName, preview.content);
                  toast.success("PDF download started");
                }}
              >
                <Download className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Print"
                onClick={() =>
                  printDocumentHtml(preview.title, preview.content)
                }
              >
                <Printer className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                onClick={() => setFullscreen((f) => !f)}
              >
                {fullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Expand className="h-4 w-4" />
                )}
              </ToolbarButton>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-slate-100 p-6">
          <div
            className="mx-auto min-h-[520px] rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-transform"
            style={{
              width: `${zoom}%`,
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "center top",
            }}
          >
            <div className="mb-6 border-b border-slate-200 pb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Swaroop Customer Portal
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                {preview.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {preview.categoryLabel}
                {preview.documentNumber ? ` · ${preview.documentNumber}` : ""}
              </p>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-slate-700">
              {preview.content}
            </pre>
            <div className="mt-8 border-t border-dashed border-slate-200 pt-4 text-center text-[11px] text-slate-400">
              Demo PDF preview · Frontend only · Not a legal tax document
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToolbarButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className="h-8 w-8 rounded-lg"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}
